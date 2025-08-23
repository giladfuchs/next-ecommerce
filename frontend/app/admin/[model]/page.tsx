"use client";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  use,
} from "react";

import type { ColDef } from "ag-grid-community";
import { Container, Grid } from "@mui/material";
import AGTable from "@/components/admin/table";
import { useLoading } from "@/lib/provider/LoadingProvider";
import { LoadingTable } from "@/components/shared/loading-skeleton";
import { TableHeader } from "@/components/admin/table/table-header";

import {
  AGTableModelType,
  get_columns_ag_by_model,
  ModelType,
} from "@/lib/types";
import { filterBySearch } from "@/lib/helper";
import { fetchRowsByModel, useAppDispatch, useAppSelector } from "@/lib/store";

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
