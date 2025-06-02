"use client";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";
import { Container, Grid } from "@mui/material";
import AGTable from "components/admin/table";
import { useLoading } from "lib/provider/LoadingProvider";
import { LoadingTable } from "components/shared/loading-skeleton";
import {
  AGTableModelType,
  get_columns_ag_by_model,
  ModelType,
} from "lib/types";
import { cache } from "lib/api";
import { filterBySearch } from "lib/helper";
import { modelFetchers } from "lib/config/mappings";
import { TableHeader } from "components/admin/table/table-header";

export default function AdminPage({
  params: { model },
}: {
  params: { model: ModelType };
}) {
  const { loading } = useLoading();

  const [rows, setRows] = useState<AGTableModelType[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const cols: ColDef<AGTableModelType>[] = useMemo(
    () => get_columns_ag_by_model(model),
    [model],
  );

  const loadData = useCallback(async (targetModel: ModelType) => {
    try {
      const data = (await modelFetchers[targetModel]?.(true)) ?? [];
      cache.setByModel(targetModel, data);
      setRows(data);
    } catch (err) {
      console.error("❌ Failed to load model data", err);
    }
  }, []);

  useEffect(() => {
    const cached = cache.getByModel(model);
    if (cached.length > 0) setRows(cached);

    void loadData(model);
  }, [model]);

  const filteredRows = useMemo(
    () => filterBySearch(rows, searchValue),
    [searchValue, rows],
  );
  const onSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  return (
    <Container disableGutters sx={{ px: 2 }}>
      <TableHeader
        model={model}
        count={filteredRows.length}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

      <Grid container justifyContent="center" mt={2}>
        {loading && rows.length === 0 ? (
          <LoadingTable />
        ) : (
          <AGTable cols={cols} rows={filteredRows} />
        )}
      </Grid>
    </Container>
  );
}
