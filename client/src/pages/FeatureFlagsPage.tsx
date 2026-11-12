import { useState } from "react";
import { Checkbox } from "../components/Checkbox";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { organizationService } from "../services/organizationService";
import type { FeatureFlags } from "../types/models";
import { isPrivilegedRole } from "../utils/permissions";

export const FeatureFlagsPage = () => {
  const { organization, setOrganizationState, user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(
    organization?.featureFlags ?? {
      scheduling: false,
      advancedReports: false,
      customBranding: false,
    },
  );
  const [status, setStatus] = useState<string | null>(null);
  const canEdit = isPrivilegedRole(user?.role);

  const handleSave = async () => {
    setStatus(null);

    try {
      const nextOrganization =
        await organizationService.updateFeatureFlags(flags);
      setOrganizationState(nextOrganization);
      setFlags(nextOrganization.featureFlags);
      setStatus("Feature flags updated.");
    } catch (saveError) {
      setStatus(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update flags",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        description="Control which product areas are available for the current organization."
        title="Feature flags"
      />
      <div className="rounded-[20px] bg-white p-8 shadow-sm">
        <ul className="space-y-4">
          {Object.entries(flags).map(
            ([flagKey, enabled]: [string, boolean]) => (
              <li
                className="flex items-center justify-between rounded-[12px] border border-slate-200 p-[18px]"
                key={flagKey}
              >
                <div>
                  <p className="text-xl font-semibold text-ink">
                    {flagKey.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="text-[13px] text-slate-500">
                    Toggle organization access for this feature area.
                  </p>
                </div>
                <Checkbox
                  checked={enabled}
                  disabled={!canEdit}
                  onChange={(checked) =>
                    setFlags((current) => ({
                      ...current,
                      [flagKey]: checked,
                    }))
                  }
                />
              </li>
            ),
          )}
        </ul>
        {status ? (
          <p className="mt-4 text-sm text-slate-600">{status}</p>
        ) : null}
        <button
          className="mt-6 rounded-[12px] bg-ink px-6 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canEdit}
          onClick={() => void handleSave()}
          type="button"
        >
          {canEdit ? "Save flags" : "Owners and admins only"}
        </button>
      </div>
    </div>
  );
};
