"use client";
import { useEffect, useState, useRef, ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import AccessibleIcon from "@mui/icons-material/Accessible";
import { Box, IconButton, Typography, Stack } from "@mui/material";
import { createAccessibilityButtons } from "lib/config";
import {localeCache} from "@/lib/api";

const ActionItem = ({
                        icon,
                        labelId,
                        onClick,
                        selected = false,
                    }: {
    icon: ReactNode;
    labelId: string;
    onClick: () => void;
    selected?: boolean;
}) => (
    <Box
        onClick={onClick}
        role="button"
        tabIndex={0}
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            cursor: "pointer",
            backgroundColor: selected
                ? "var(--category-active-bg, #e0f7fa)"
                : "transparent",
            fontWeight: selected ? "bold" : "normal",
            transition: "background-color 0.2s",
            "&:hover": {
                backgroundColor: "var(--category-hover-bg, #e0f7fa)",
            },
            outline: "none",
        }}
    >
        <Typography fontSize="0.9rem">
            <FormattedMessage id={labelId} />
        </Typography>
        {icon}
    </Box>
);

export default function AccessibilityBarClient() {
    const buttonIconOpenRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [fontSize, setFontSize] = useState(100);
    const [highContrast, setHighContrast] = useState(false);
    const [invert, setInvert] = useState(false);
    const [grayscale, setGrayscale] = useState(false);
    const [underlineLinks, setUnderlineLinks] = useState(false);
    const [readableFont, setReadableFont] = useState(false);

    useEffect(() => {
        const sizes = Array.from(
            { length: 13 },
            (_, i) => `font-size-${80 + i * 10}`,
        );
        document.documentElement.classList.remove(...sizes);
        document.documentElement.classList.add(`font-size-${fontSize}`);
        document.documentElement.classList.toggle("grayscale", grayscale);
        document.documentElement.classList.toggle("high-contrast", highContrast);
        document.documentElement.classList.toggle("invert", invert);
        document.documentElement.classList.toggle(
            "underline-links",
            underlineLinks,
        );
        document.documentElement.classList.toggle("readable-font", readableFont);
    }, [fontSize, grayscale, highContrast, invert, underlineLinks, readableFont]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                !panelRef.current?.contains(event.target as Node) &&
                !buttonIconOpenRef.current?.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const increaseFont = () => {
        if (fontSize < 200) setFontSize(fontSize + 10);
    };
    const decreaseFont = () => {
        if (fontSize > 80) setFontSize(fontSize - 10);
    };
    const reset = () => {
        setFontSize(100);
        setHighContrast(false);
        setInvert(false);
        setGrayscale(false);
        setUnderlineLinks(false);
        setReadableFont(false);
    };

    const accessibility_buttons = createAccessibilityButtons(
        increaseFont,
        decreaseFont,
        reset,
        grayscale,
        setGrayscale,
        highContrast,
        setHighContrast,
        invert,
        setInvert,
        underlineLinks,
        setUnderlineLinks,
        readableFont,
        setReadableFont,
    );

    return (
        <div
            className="hide-in-admin"
            dir={localeCache.dir()}
            style={{
                position: "fixed",
                top: "90%",
                transform: "translateY(-90%)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                [localeCache.isRtl() ? "left" : "right"]: "0.2rem",
            }}
        >
            <IconButton
                ref={buttonIconOpenRef}
                onClick={() => setOpen(!open)}
                sx={{
                    backgroundColor: "#124cda",
                    color: "var(--color-bg)",
                    "&:hover": { backgroundColor: "#124cda" },
                    "&:focus, &:active": { backgroundColor: "#124cda", opacity: 1 },
                    zIndex: 10,
                }}
            >
                <AccessibleIcon />
            </IconButton>

            {open && (
                <Box
                    ref={panelRef}
                    sx={{
                        ...(fontSize > 140 && { mt: 25 }),
                        ml: 1,
                        width: 200,
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 3,
                        border: "1px solid var(--color-text)",
                        color: "var(--color-text)",
                        backgroundColor: "var(--color-bg)",
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        fontSize="1rem"
                        mb={1}
                    >
                        <FormattedMessage id="accessibility.title" />
                    </Typography>

                    <Stack key={Math.random().toString(36)} spacing={1}>
                        {accessibility_buttons.map(({ id, icon, onClick, selected }) => (
                            <ActionItem
                                key={id}
                                labelId={id}
                                icon={icon}
                                onClick={onClick}
                                selected={selected}
                            />
                        ))}
                    </Stack>
                </Box>
            )}
        </div>
    );
}
