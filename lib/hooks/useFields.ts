"use client";

import { useEffect, useRef } from "react";
import { HttpRuleRepository } from "../infrastructure/http-repository";
import { useFieldsStore } from "../stores/fields-store";

const repository = new HttpRuleRepository();

/**
 * Fetches the builder's field catalog into `useFieldsStore` once per session.
 * Call this from the builder's entry point to preload the catalog before any
 * panel that reads it mounts. Components that just need the data should read
 * `useFieldsStore` selectors directly instead of calling this again.
 */
export function useFieldsBootstrap(): void {
  const isLoaded = useFieldsStore((s) => s.isLoaded);
  const setLoading = useFieldsStore((s) => s.setLoading);
  const setError = useFieldsStore((s) => s.setError);
  const setConfig = useFieldsStore((s) => s.setConfig);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || isLoaded) return;
    loadedRef.current = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const healthy = await repository.healthcheck();
        if (!healthy) {
          setLoading(false);
          return;
        }

        const config = await repository.getBuilderConfig();
        setConfig({
          fields: config.rule_fields,
          enums: config.enums,
          operatorGroups: config.operator_groups,
          rootVars: config.root_vars,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load builder config",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoaded, setLoading, setError, setConfig]);
}
