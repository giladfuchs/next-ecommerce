"use client";
import { useIntl } from "react-intl";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import {
  ActionRenderer,
  OrderItemsRenderer,
  OrderStatusRenderer,
} from "./renderer";
import { AGTableModelType } from "lib/types";
import { localeCache } from "lib/api";

const defaultColDef: ColDef = {
  resizable: true,
  filter: true,
  sortable: true,
};

const AGTable = ({
  cols,
  rows,
}: {
  cols: ColDef<AGTableModelType>[];
  rows: AGTableModelType[];
}) => {
  const intl = useIntl();
  const localizedCols: ColDef<AGTableModelType>[] = cols.map((col) => ({
    ...col,
    headerName: intl.formatMessage({ id: `table.headerName.${col.field}` }),
    cellStyle: {
      textAlign: localeCache.isRtl() ? "right" : "left",
      direction: localeCache.dir(),
    },
    headerClass: localeCache.isRtl()
      ? "ag-header-cell-rtl"
      : "ag-header-cell-ltr",
  }));

  return (
    <div
      className="ag-theme-alpine"
      data-testid="ag-table"
      dir={localeCache.dir()}
      style={{
        height: 600,
        width: "100%",
        overflowX: "auto",
        direction: localeCache.dir(),
      }}
    >
      <AgGridReact<AGTableModelType>
        rowData={rows}
        columnDefs={localizedCols}
        defaultColDef={defaultColDef}
        enableRtl={localeCache.isRtl()}
        rowHeight={30}
        frameworkComponents={{
          ActionRenderer,
          OrderItemsRenderer,
          OrderStatusRenderer,
        }}
      />
    </div>
  );
};

export default AGTable;
