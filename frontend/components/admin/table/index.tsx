"use client";
import { useIntl } from "react-intl";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridReadyEvent,
  FilterChangedEvent,
  ModelUpdatedEvent,
} from "ag-grid-community";
import {
  ActionRenderer,
  OrderItemsRenderer,
  OrderStatusRenderer,
} from "./renderer";
import { AGTableModelType } from "lib/types";
import { Typography } from "@mui/material";
import { localeCache } from "@/lib/api";

const defaultColDef: ColDef = { resizable: true, filter: true, sortable: true };

interface Props {
  cols: ColDef<AGTableModelType>[];
  rows: AGTableModelType[];
}

const AGTable = ({ cols, rows }: Props) => {
  const intl = useIntl();
  const isRtl = localeCache.isRtl();
  const direction = localeCache.dir();

  const gridRef = useRef<AgGridReact<AGTableModelType>>(null);
  const [filteredCount, setFilteredCount] = useState(rows.length);
  const [containerHeightRem, setContainerHeightRem] = useState<string>("42rem");

  useEffect(() => {
    const compute = () => {
      const rootSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize || "16",
      );
      const hRem = (window.innerHeight * 0.7) / rootSize;
      setContainerHeightRem(`${hRem}rem`);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const localizedCols = useMemo<ColDef<AGTableModelType>[]>(() => {
    return cols.map((col) => ({
      ...col,
      headerName:
        col.headerName ??
        intl.formatMessage({ id: `table.headerName.${col.field}` }),
      valueFormatter:
        col.valueFormatter ??
        ((p) => (p.value && typeof p.value === "object" ? "" : p.value)),
    }));
  }, [cols, intl]);

  const rafIdRef = useRef<number | null>(null);
  const updateCounts = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api || api.isDestroyed()) return;
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      setFilteredCount(api.getDisplayedRowCount());
    });
  }, []);

  useEffect(
    () => () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    },
    [],
  );

  const onGridReady = (e: GridReadyEvent) => {
    setFilteredCount(e.api.getDisplayedRowCount());
  };
  const onFilterChanged = (_e: FilterChangedEvent) => updateCounts();
  const onModelUpdated = (_e: ModelUpdatedEvent) => updateCounts();

  return (
    <>
      {filteredCount < rows.length && (
        <Typography variant="body1" align="center" dir="ltr">
          {filteredCount} / {rows.length}
        </Typography>
      )}
      <div
        className="ag-theme-quartz"
        data-testid="ag-table"
        dir={direction}
        style={{
          height: containerHeightRem,
          width: "100%",
          overflowX: "auto",
          direction,
        }}
      >
        <AgGridReact<AGTableModelType>
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={rows}
          columnDefs={localizedCols}
          defaultColDef={defaultColDef}
          enableRtl={isRtl}
          ensureDomOrder={false}
          enableCellTextSelection
          suppressColumnVirtualisation={false}
          suppressRowVirtualisation={false}
          rowHeight={30}
          components={{
            ActionRenderer,
            OrderItemsRenderer,
            OrderStatusRenderer,
          }}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onModelUpdated={onModelUpdated}
        />
      </div>
    </>
  );
};

export default AGTable;
