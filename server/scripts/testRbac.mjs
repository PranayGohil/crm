// Offline unit test for the stage-based RBAC engine (no DB, no writes).
// Run: node scripts/testРбacPermissions.mjs
import {
  getProjectPermissionQuery,
  getClientStageQuery,
  getEmployeeStageQuery,
  canAdminAccessByStages,
  canAdminAccessProject,
  canAdminAccessClient,
  canAdminAccessEmployee,
  canManageStages,
} from "../utils/projectPermissions.js";

let pass = 0, fail = 0;
const eq = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "✅" : "❌"} ${label}${ok ? "" : `\n     got:  ${JSON.stringify(got)}\n     want: ${JSON.stringify(want)}`}`);
  ok ? pass++ : fail++;
};
const t = (label, got) => eq(label, got, true);
const f = (label, got) => eq(label, got, false);

// ── Actors ──
const superAdmin = { role: "super-admin", _id: "sa" };
const cadAdmin   = { role: "admin", _id: "a1", manage_stages: ["CAD Design"] };
const renderAdmin= { role: "admin", _id: "a2", manage_stages: ["Render"] };
const allAdmin   = { role: "admin", _id: "a3", manage_stages: [] }; // empty = all
const employee   = { role: "employee", _id: "e1", manage_stages: ["CAD Design"] };
const client     = { role: "client", _id: "c1" };

console.log("\n── getProjectPermissionQuery ──");
eq("super-admin → no filter", getProjectPermissionQuery(superAdmin), {});
eq("empty-stage admin → no filter (all)", getProjectPermissionQuery(allAdmin), {});
eq("client → own projects", getProjectPermissionQuery(client), { client_id: "c1" });
eq("CAD admin → overlap + no-stage + assigned", getProjectPermissionQuery(cadAdmin), {
  $or: [
    { stages: { $in: ["CAD Design"] } },
    { "assign_to.id": "a1" },
    { stages: { $size: 0 } },
    { stages: { $exists: false } },
  ],
});
eq("employee → overlap + assigned only (NO no-stage widening)", getProjectPermissionQuery(employee), {
  $or: [
    { stages: { $in: ["CAD Design"] } },
    { "assign_to.id": "e1" },
  ],
});

console.log("\n── getEmployeeStageQuery / getClientStageQuery ──");
eq("super-admin employees → {}", getEmployeeStageQuery(superAdmin), {});
eq("empty admin employees → {}", getEmployeeStageQuery(allAdmin), {});
eq("employee actor → {} (unaffected)", getEmployeeStageQuery(employee), {});
eq("CAD admin employees → overlap + no-stage", getEmployeeStageQuery(cadAdmin), {
  $or: [
    { manage_stages: { $in: ["CAD Design"] } },
    { manage_stages: { $size: 0 } },
    { manage_stages: { $exists: false } },
  ],
});
eq("CAD admin clients → overlap + no-stage", getClientStageQuery(cadAdmin), {
  $or: [
    { stages: { $in: ["CAD Design"] } },
    { stages: { $size: 0 } },
    { stages: { $exists: false } },
  ],
});

console.log("\n── canAdminAccessByStages (overlap, admin-only) ──");
t("super-admin → any record", canAdminAccessByStages(superAdmin, ["Render"]));
t("CAD admin → CAD record", canAdminAccessByStages(cadAdmin, ["CAD Design"]));
f("CAD admin → Render record", canAdminAccessByStages(cadAdmin, ["Render"]));
t("CAD admin → multi-stage incl CAD", canAdminAccessByStages(cadAdmin, ["CAD Design", "Render"]));
t("CAD admin → no-stage record (shared)", canAdminAccessByStages(cadAdmin, []));
t("employee actor → unaffected (always true here)", canAdminAccessByStages(employee, ["Render"]));
t("empty-stage admin → all", canAdminAccessByStages(allAdmin, ["Render"]));

console.log("\n── canAdminAccessProject ──");
t("CAD admin → CAD project", canAdminAccessProject(cadAdmin, { stages: ["CAD Design"], assign_to: [] }));
f("CAD admin → Render project", canAdminAccessProject(cadAdmin, { stages: ["Render"], assign_to: [] }));
t("CAD admin → assigned Render project", canAdminAccessProject(cadAdmin, { stages: ["Render"], assign_to: [{ id: "a1" }] }));
t("CAD admin → no-stage project", canAdminAccessProject(cadAdmin, { stages: [], assign_to: [] }));
t("client → own project", canAdminAccessProject(client, { client_id: "c1", stages: ["Render"] }));
f("client → other's project", canAdminAccessProject(client, { client_id: "zzz", stages: ["Render"] }));

console.log("\n── canAdminAccessClient / canAdminAccessEmployee ──");
t("CAD admin → CAD client", canAdminAccessClient(cadAdmin, { stages: ["CAD Design"] }));
f("CAD admin → Render client", canAdminAccessClient(cadAdmin, { stages: ["Render"] }));
t("CAD admin → no-stage client (shared)", canAdminAccessClient(cadAdmin, { stages: [] }));
t("CAD admin → CAD employee", canAdminAccessEmployee(cadAdmin, { manage_stages: ["CAD Design"] }));
f("CAD admin → Render employee", canAdminAccessEmployee(cadAdmin, { manage_stages: ["Render"] }));
t("render admin → Render employee", canAdminAccessEmployee(renderAdmin, { manage_stages: ["Render"] }));

console.log("\n── canManageStages (create/assign — subset) ──");
t("super-admin → assign anything", canManageStages(superAdmin, ["CAD Design", "Render"]));
t("CAD admin → assign CAD only", canManageStages(cadAdmin, ["CAD Design"]));
f("CAD admin → assign incl Render", canManageStages(cadAdmin, ["CAD Design", "Render"]));
t("CAD admin → assign no stages (shared)", canManageStages(cadAdmin, []));
t("empty-stage admin → assign anything", canManageStages(allAdmin, ["Render"]));

console.log(`\n──────────────\nRESULT: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
