// REST initial hydration. On mount we swap the stores' seed initializers for a
// fetch of the backend's GET endpoints — the swap the CLAUDE.md has been
// anticipating. Each endpoint returns a snake_case entity array; we coerce via
// the matching *DTO .toModel() (the same path the seeds use) and set() the
// store. The hooks/views are untouched.
//
// A failed fetch is logged but never crashes the app — the seed data already in
// the store keeps the UI populated, so a missing backend degrades to the seeded
// offline view rather than a blank screen.

import { usePersons } from "../../store/persons_store";
import { useEvents } from "../../store/events_store";
import { useChecklists } from "../../store/checklists_store";
import { useFiles } from "../../store/files_store";
import { PersonDTO } from "../dto/person.dto";
import { EventDTO } from "../dto/event.dto";
import { ChecklistDTO } from "../dto/checklist.dto";
import { FolderDTO } from "../dto/folder.dto";
import { FileEntryDTO } from "../dto/file_entry.dto";
import { API_BASE, API_ENDPOINTS } from "../constants";

const fetchJSON = async (path) => {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
};

const toModels = (rows, DTO) => (Array.isArray(rows) ? rows : []).map((r) => new DTO(r).toModel());

// loadAll fetches every entity endpoint and hydrates its store. Runs in
// parallel; each store is set independently as its fetch resolves.
export async function loadAll() {
  const setPersons = (rows) => usePersons.setState({ persons: toModels(rows, PersonDTO) });
  const setEvents = (rows) => useEvents.setState({ events: toModels(rows, EventDTO) });
  const setLists = (rows) => useChecklists.setState({ lists: toModels(rows, ChecklistDTO) });
  const setFolders = (rows) => useFiles.setState({ folders: toModels(rows, FolderDTO) });
  const setFiles = (rows) => useFiles.setState({ files: toModels(rows, FileEntryDTO) });

  const jobs = [
    [API_ENDPOINTS.persons, setPersons, "persons"],
    [API_ENDPOINTS.events, setEvents, "events"],
    [API_ENDPOINTS.checklists, setLists, "checklists"],
    [API_ENDPOINTS.folders, setFolders, "folders"],
    [API_ENDPOINTS.files, setFiles, "files"],
  ];

  await Promise.all(
    jobs.map(async ([path, setter, name]) => {
      try {
        setter(await fetchJSON(path));
      } catch (e) {
        console.error(`load ${name} failed (keeping seed data)`, e);
      }
    }),
  );
}