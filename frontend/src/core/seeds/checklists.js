// Shared checklist lists (SEED_LISTS). Lives in `core/seeds/` (like SEED_PERSONS
// and SEED_EVENTS) because the dashboard's "checklists" section is a view over
// the same lists — clicking it navigates to the checklist feature, so the
// dashboard must reference the real list ids. Per-feature data still seeds in
// its own hook; this is the cross-feature reference-data exception, converging
// to a single backend fetch once it lands.

import { ChecklistDTO } from "../dto/checklist.dto";

export const SEED_LISTS = [
  new ChecklistDTO({
    id: 1,
    title: "Groceries",
    person_ids: [],
    items: [
      { id: 2, itemName: "Milk", is_done: true },
      { id: 3, itemName: "Bread", is_done: false },
      { id: 4, itemName: "Eggs", is_done: false },
      { id: 5, itemName: "Pasta", is_done: false },
      { id: 6, itemName: "Tomatoes", is_done: false },
    ],
  }).toModel(),
  new ChecklistDTO({
    id: 2,
    title: "Hardware store",
    person_ids: [2],
    items: [
      { id: 1, itemName: "Screws M4", is_done: false },
      { id: 2, itemName: "Paintbrush", is_done: false },
    ],
  }).toModel(),

  new ChecklistDTO({
    id: 3,
    title: "Edeka",
    person_ids: [1, 3],
    items: [
      { id: 1, itemName: "Mie Noodles", is_done: false },
      { id: 2, itemName: "Tomatoes", is_done: true },
    ],
  }).toModel(),
  new ChecklistDTO({
    id: 4,
    title: "Fitor",
    person_ids: [1, 3],
    items: [
      { id: 1, itemName: "Mie Noodles", is_done: false },
      { id: 2, itemName: "Tomatoes", is_done: true },
    ],
  }).toModel(),
  new ChecklistDTO({
    id: 4,
    title: "Fortesa",
    person_ids: [1, 3],
    items: [
      { id: 1, itemName: "Mie Noodles", is_done: false },
      { id: 2, itemName: "Tomatoes", is_done: true },
    ],
  }).toModel(),
];