"use client";
import { useIntl } from "react-intl";
import { useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import {
  ActionRenderer,
  OrderItemsRenderer,
  OrderStatusRenderer,
} from "./renderer";
import { AGTableModelType } from "lib/types";
import { Typography } from "@mui/material";
import { localeCache } from "@/lib/api";

const defaultColDef: ColDef = {
  resizable: true,
  filter: true,
  sortable: true,
};

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
  const localizedCols: ColDef<AGTableModelType>[] = cols.map((col) => ({
    ...col,
    headerName:
      col.headerName ??
      intl.formatMessage({ id: `table.headerName.${col.field}` }),
    cellStyle: {
      textAlign: isRtl ? "right" : "left",
      direction,
    },
    headerClass: isRtl ? "ag-header-cell-rtl" : "ag-header-cell-ltr",
  }));

  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api) return;

    const updateCounts = () => {
      setFilteredCount(api.getDisplayedRowCount());
    };

    api.addEventListener("filterChanged", updateCounts);
    api.addEventListener("modelUpdated", updateCounts);

    return () => {
      api.removeEventListener("filterChanged", updateCounts);
      api.removeEventListener("modelUpdated", updateCounts);
    };
  }, [rows]);

  return (
    <>
      {filteredCount < rows.length && (
        <Typography variant="body1" align="center" dir="ltr">
          {filteredCount} / {rows.length}
        </Typography>
      )}
      <div
        className="ag-theme-alpine"
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
          theme="legacy"
          ref={gridRef}
          rowData={rows}
          columnDefs={localizedCols}
          defaultColDef={defaultColDef}
          enableRtl={isRtl}
          ensureDomOrder={true}
          enableCellTextSelection={true}
          rowHeight={30}
          components={{
            ActionRenderer,
            OrderItemsRenderer,
            OrderStatusRenderer,
          }}
        />
      </div>
    </>
  );
};

export default AGTable;
