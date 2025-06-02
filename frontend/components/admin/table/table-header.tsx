"use client";
import { ChangeEvent } from "react";
import { FormattedMessage } from "react-intl";
import { useRouter } from "next/navigation";
import { ModelType } from "lib/types";
import { Button, Grid, TextField } from "@mui/material";
import { Add as AddIcon, Image as ImageIcon } from "@mui/icons-material";

const ActionButtons = ({ model }: { model: ModelType }) => {
  const router = useRouter();
  return (
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
  );
};

interface Props {
  model: ModelType;
  count: number;
  searchValue: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const TableHeader = ({
  model,
  count,
  searchValue,
  onSearchChange,
}: Props) => {
  return (
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
        {count}
      </p>

      <FormattedMessage id="admin.search.placeholder">
        {(msg) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder={String(msg)}
            aria-label={String(msg)}
            value={searchValue}
            onChange={onSearchChange}
            sx={{ minWidth: 200, mt: 2 }}
          />
        )}
      </FormattedMessage>

      {model !== "order" && <ActionButtons model={model} />}
    </Grid>
  );
};
