"use client";

import { Container, Grid } from "@mui/material";
import { useCallback, useEffect, useMemo, useState, use } from "react";

import AGTable from "@/components/admin/table";
import { TableHeader } from "@/components/admin/table/table-header";
import { LoadingTable } from "@/components/shared/loading-skeleton";
import { filterBySearch } from "@/lib/helper";
import { useLoading } from "@/lib/provider/LoadingProvider";
import { fetchRowsByModel, useAppDispatch, useAppSelector } from "@/lib/store";
import { get_columns_ag_by_model } from "@/lib/types";

import type { AGTableModelType, ModelType } from "@/lib/types";
import type { ColDef } from "ag-grid-community";
import type { ChangeEvent } from "react";

export default function AdminPage({
  params,
}: {
  params: Promise<{ model: ModelType }>;
}) {
  const dispatch = useAppDispatch();
  const { loading } = useLoading();
  const { model } = use(params);

  const [searchValue, setSearchValue] = useState("");

  const rows: AGTableModelType[] = useAppSelector(
    (state) => state.admin[model],
  ) as AGTableModelType[];

  const cols: ColDef<AGTableModelType>[] = useMemo(
    () => get_columns_ag_by_model(model),
    [model],
  );

  useEffect(() => {
    dispatch(fetchRowsByModel({ model }));
  }, [dispatch, model]);
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
