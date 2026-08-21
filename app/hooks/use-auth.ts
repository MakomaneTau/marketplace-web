"use client";

import{useEffect,useState}from"react";

import{getStoredAuth,type StoredAuth}from"@/app/libs/api";

export function useAuth(){const[auth,setAuth]=useState<StoredAuth|null>(null);const[ready,setReady]=useState(false);useEffect(()=>{const sync=()=>{setAuth(getStoredAuth());setReady(true);};sync();window.addEventListener("marketplace-auth",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("marketplace-auth",sync);window.removeEventListener("storage",sync);};},[]);return{auth,ready};}
