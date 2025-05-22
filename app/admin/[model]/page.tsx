"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Container, Grid, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import { FormattedMessage, useIntl } from "react-intl";
import { ColDef } from "ag-grid-community";

import { AGTableModelType, get_columns_by_title, ModelType } from "lib/types";
import { getCategories, getOrders, getProducts } from "lib/api";
import { cache } from "lib/api/cache";
import AGTable from "components/admin/table/AGTable";
import { useLoading } from "lib/provider/LoadingProvider";
import { LoadingTable } from "components/shared/Loading";

export default function AdminPage({
  params,
}: {
  params: { model: ModelType };
}) {
  const router = useRouter();
  const { model } = params;
  const { formatMessage } = useIntl();
  const { loading } = useLoading();

  const [rows, setRows] = useState<AGTableModelType[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const cols: ColDef<AGTableModelType>[] = get_columns_by_title(model);

  useEffect(() => {
    const cached = cache.getByModel(model);
    if (cached.length > 0) {
      setRows(cached);
    }

    const init = async () => {
      try {
        const data =
          model === ModelType.product
            ? await getProducts(true)
            : model === ModelType.order
              ? await getOrders()
              : await getCategories(true);

        cache.setByModel(model, data);
        setRows(data);
      } catch (err) {
        console.error("❌ Failed to load model data", err);
      }
    };

    void init();
  }, [model]);

  const filteredRows = useMemo(() => {
    if (!searchValue) return rows;
    const regex = new RegExp(searchValue, "i");
    return rows.filter((row) => regex.test(Object.values(row).join(" ")));
  }, [searchValue, rows]);

  return (
    <Container disableGutters sx={{ px: 2 }}>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        direction="row"
      >
        <h2 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
          <FormattedMessage id={`admin.${model}.title`} />
        </h2>

        <p
          data-testid="admin-row-count"
          style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: 4 }}
        >
          {filteredRows.length}
        </p>

        <TextField
          variant="outlined"
          size="small"
          placeholder={formatMessage({ id: "admin.search.placeholder" })}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ minWidth: 200, mt: 2 }}
        />

        {model !== "order" && (
          <Grid item display="flex" gap={2}>
            <Button
              data-testid={`add-${model}-button`}
              variant="contained"
              onClick={() => router.push(`/admin/form/${model}/add`)}
              startIcon={<AddIcon />}
            >
              <FormattedMessage id={`admin.${model}.add`} />
            </Button>

            {model === "product" && (
              <Button
                variant="outlined"
                onClick={() => window.open("/admin/form/image", "_blank")}
                startIcon={<ImageIcon />}
              >
                <FormattedMessage id="admin.product.image" />
              </Button>
            )}
          </Grid>
        )}
      </Grid>

      <Grid container justifyContent="center" mt={2}>
        {loading && cache.getByModel(model).length === 0 ? (
          <LoadingTable />
        ) : (
          <AGTable cols={cols} rows={filteredRows} />
        )}
      </Grid>
    </Container>
  );
}
