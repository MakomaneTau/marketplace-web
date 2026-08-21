const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
const SESSION_KEY = "marketplace.session";

export interface ApiSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
  tokenType: string;
}
export interface AuthUser { id: string; email?: string; user_metadata?: { role?: "buyer" | "seller"; [key: string]: unknown } }
export interface StoredAuth { session: ApiSession; user: AuthUser; persistent: boolean }
export class ApiClientError extends Error { constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); } }

function stores() { return typeof window === "undefined" ? [] : [window.localStorage, window.sessionStorage]; }
export function getStoredAuth(): StoredAuth | null {
  for (const store of stores()) { const raw=store.getItem(SESSION_KEY); if(raw) try{return JSON.parse(raw) as StoredAuth;}catch{store.removeItem(SESSION_KEY);} }
  return null;
}
export function storeAuth(auth: StoredAuth) { if(typeof window==="undefined")return; localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);(auth.persistent?localStorage:sessionStorage).setItem(SESSION_KEY,JSON.stringify(auth));window.dispatchEvent(new Event("marketplace-auth")); }
export function clearAuth(){if(typeof window==="undefined")return;localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);window.dispatchEvent(new Event("marketplace-auth"));}

async function parse<T>(response:Response):Promise<T>{const body=response.status===204?null:await response.json().catch(()=>null);if(!response.ok){const error=body?.error;throw new ApiClientError(response.status,error?.code||"REQUEST_FAILED",error?.message||"Request failed.",error?.details);}return body?.data as T;}
async function refresh(auth:StoredAuth){const response=await fetch(`${API_URL}/api/v1/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:auth.session.refreshToken})});const data=await parse<{session:ApiSession;user:AuthUser}>(response);const next={...data,persistent:auth.persistent};storeAuth(next);return next;}
export async function apiRequest<T>(path:string,init:RequestInit&{auth?:boolean}={}):Promise<T>{const {auth:needsAuth=false,...request}=init;let current=getStoredAuth();const headers=new Headers(request.headers);if(request.body&&!headers.has("Content-Type")&&!(request.body instanceof FormData))headers.set("Content-Type","application/json");if(needsAuth&&current)headers.set("Authorization",`Bearer ${current.session.accessToken}`);let response=await fetch(`${API_URL}/api/v1${path}`,{...request,headers,cache:"no-store"});if(response.status===401&&needsAuth&&current?.session.refreshToken){try{current=await refresh(current);headers.set("Authorization",`Bearer ${current.session.accessToken}`);response=await fetch(`${API_URL}/api/v1${path}`,{...request,headers,cache:"no-store"});}catch{clearAuth();}}return parse<T>(response);}
export const apiPublic=<T>(path:string,init?:RequestInit)=>apiRequest<T>(path,init);
export async function login(email:string,password:string,persistent:boolean){const data=await apiRequest<{session:ApiSession;user:AuthUser}>("/auth/login",{method:"POST",body:JSON.stringify({email,password})});storeAuth({...data,persistent});return data;}
export async function signup(input:Record<string,unknown>){const data=await apiRequest<{session:ApiSession|null;user:AuthUser}>("/auth/signup",{method:"POST",body:JSON.stringify(input)});if(data.session)storeAuth({...data,session:data.session,persistent:true});return data;}
export async function logout(){try{await apiRequest<void>("/auth/logout",{method:"POST",auth:true});}finally{clearAuth();}}
export function apiErrorMessage(error:unknown){return error instanceof ApiClientError?error.message:"Unable to reach the marketplace service. Please try again.";}
