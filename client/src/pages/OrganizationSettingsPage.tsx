import { useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { organizationService } from "../services/organizationService";
import { isPrivilegedRole } from "../utils/permissions";

export const OrganizationSettingsPage = () => {
  const { organization, setOrganizationState, user } = useAuth();
  const [formState, setFormState] = useState({
    name: organization?.name ?? "",
    slug: organization?.slug ?? "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const canEdit = isPrivilegedRole(user?.role);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      const nextOrganization =
        await organizationService.updateCurrent(formState);
      setOrganizationState(nextOrganization);
      setStatus("Organization updated.");
    } catch (submitError) {
      setStatus(
        submitError instanceof Error ? submitError.message : "Update failed",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        description="Maintain the tenant identity that scopes every protected resource."
        title="Organization settings"
      />
      <form
        className="rounded-3xl bg-white p-6 shadow-sm"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
            disabled={!canEdit}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            value={formState.name}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
            disabled={!canEdit}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                slug: event.target.value,
              }))
            }
            value={formState.slug}
          />
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
          <button
            className="rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canEdit}
            type="submit"
          >
            {canEdit ? "Save organization" : "Owners and admins only"}
          </button>
        </div>
      </form>
    </div>
  );
};
