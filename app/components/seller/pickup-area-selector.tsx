"use client";

import { MapPin, Plus, Trash2 } from "lucide-react";

import {
  southAfricanUniversities,
  type University,
} from "@/app/data/universities";

export interface PickupAreaSelection {
  id: string;
  universitySlug: string;
  campusName: string;
}

interface PickupAreaSelectorBaseProps {
  universities?: University[];
}

interface SinglePickupAreaSelectorProps extends PickupAreaSelectorBaseProps {
  multiple?: false;
  value: PickupAreaSelection;
  onChange: (value: PickupAreaSelection) => void;
}

interface MultiplePickupAreaSelectorProps extends PickupAreaSelectorBaseProps {
  multiple: true;
  value: PickupAreaSelection[];
  onChange: (value: PickupAreaSelection[]) => void;
}

type PickupAreaSelectorProps =
  | SinglePickupAreaSelectorProps
  | MultiplePickupAreaSelectorProps;

export function PickupAreaSelector(props: PickupAreaSelectorProps) {
  const universities = props.universities ?? southAfricanUniversities;
  const selections = props.multiple ? props.value : [props.value];

  const updateSelection = (
    index: number,
    selection: PickupAreaSelection,
  ) => {
    if (props.multiple) {
      props.onChange(
        props.value.map((current, currentIndex) =>
          currentIndex === index ? selection : current,
        ),
      );
      return;
    }

    props.onChange(selection);
  };

  const addSelection = () => {
    if (!props.multiple) return;

    props.onChange([
      ...props.value,
      {
        id: globalThis.crypto.randomUUID(),
        universitySlug: "",
        campusName: "",
      },
    ]);
  };

  const removeSelection = (index: number) => {
    if (!props.multiple || props.value.length === 1) return;
    props.onChange(props.value.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-violet-50 p-2 text-violet-700">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-bold text-slate-950">Location and collection</h2>
          <p className="text-xs text-slate-500">
            Only share general public pickup areas—not a home address.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {selections.map((selection, index) => {
          const campuses =
            universities.find(
              (university) => university.slug === selection.universitySlug,
            )?.campuses ?? [];

          return (
            <div
              key={selection.id}
              className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  {index === 0 ? "Primary campus" : `Campus ${index + 1}`}
                </span>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  onChange={(event) =>
                    updateSelection(index, {
                      ...selection,
                      universitySlug: event.target.value,
                      campusName: "",
                    })
                  }
                  value={selection.universitySlug}
                >
                  <option value="">Select a university</option>
                  {universities.map((university) => (
                    <option key={university.slug} value={university.slug}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred pickup area
                </span>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  disabled={!selection.universitySlug}
                  onChange={(event) =>
                    updateSelection(index, {
                      ...selection,
                      campusName: event.target.value,
                    })
                  }
                  value={selection.campusName}
                >
                  <option value="">Select a pickup area</option>
                  {campuses.map((campus) => (
                    <option key={campus.name} value={campus.name}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </label>

              {props.multiple && selections.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove pickup area ${index + 1}`}
                  className="self-end rounded-xl border border-slate-300 p-3 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => removeSelection(index)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {props.multiple && (
        <button
          type="button"
          className="mt-5 flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"
          onClick={addSelection}
        >
          <Plus className="h-5 w-5" />
          Add another pickup area
        </button>
      )}
    </section>
  );
}
