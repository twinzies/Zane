"use client";

import { useEffect, useRef, useState } from "react";
import { CornerDownRight } from "lucide-react";
import type { Document, TabularReviewRow } from "../shared/types";
import { FileTypeIcon } from "../shared/FileTypeIcon";
import { ClosedFolderSvgIcon } from "../shared/FolderSvgIcon";
import { TABLE_CHECKBOX_CLASS } from "../shared/TablePrimitive";
import { TRExpandedCellSurface } from "./TRExpandedCellSurface";

interface Props {
    row: TabularReviewRow;
    sourceDocuments: Document[];
    selected: boolean;
    closeSignal: number;
    className: string;
    onToggleSelection: () => void;
    onDocumentOpen: (document: Document) => void;
}

export function TRFirstColumnCell({
    row,
    sourceDocuments,
    selected,
    closeSignal,
    className,
    onToggleSelection,
    onDocumentOpen,
}: Props) {
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timeout = window.setTimeout(() => setExpanded(false), 0);
        return () => window.clearTimeout(timeout);
    }, [closeSignal]);

    useEffect(() => {
        if (!expanded) return;
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [expanded]);

    const rowDocument =
        sourceDocuments.find((document) => document.id === row.document_id) ??
        sourceDocuments[0];
    const isDeleted = row.is_deleted ?? false;
    const deletedTitle = `${row.label} — the source file has been deleted. Previously generated results are kept.`;
    // Surviving documents come from the live fetch; deleted ones only exist as
    // the snapshot recorded when the row was built.
    const folderChildren = (
        row.source_documents ??
        sourceDocuments.map((document) => ({
            document_id: document.id,
            filename: document.filename,
            deleted: false,
        }))
    ).map((source) => ({
        ...source,
        document: source.document_id
            ? sourceDocuments.find(
                  (candidate) => candidate.id === source.document_id,
              )
            : undefined,
    }));

    return (
        <div ref={containerRef} className={`${className} relative`}>
            <input
                type="checkbox"
                checked={selected}
                onChange={onToggleSelection}
                className={TABLE_CHECKBOX_CLASS}
                aria-label={`Select ${row.label}`}
            />
            {row.row_type === "folder" ? (
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="flex min-w-0 flex-1 items-center text-left"
                    aria-expanded={expanded}
                >
                    <ClosedFolderSvgIcon
                        className={`mr-2 h-3.5 w-3.5 shrink-0 ${isDeleted ? "grayscale opacity-35" : ""}`}
                    />
                    <span
                        className={`line-clamp-1 ${isDeleted ? "text-gray-300" : ""}`}
                        title={isDeleted ? deletedTitle : row.label}
                    >
                        {isDeleted && (
                            <span className="font-medium text-gray-500">
                                [Deleted]{" "}
                            </span>
                        )}
                        {row.label}
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => {
                        if (rowDocument) onDocumentOpen(rowDocument);
                    }}
                    disabled={!rowDocument}
                    aria-label={
                        isDeleted
                            ? `${row.label} (deleted)`
                            : `Open ${row.label}`
                    }
                    className="flex min-w-0 flex-1 items-center rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-default"
                >
                    <FileTypeIcon
                        fileType={row.label}
                        className="mr-2 h-3.5 w-3.5"
                        muted={isDeleted}
                    />
                    <span
                        className={`line-clamp-1 ${isDeleted ? "text-gray-300" : ""}`}
                        title={isDeleted ? deletedTitle : row.label}
                    >
                        {isDeleted && (
                            <span className="font-medium text-gray-500">
                                [Deleted]{" "}
                            </span>
                        )}
                        {row.label}
                    </span>
                </button>
            )}

            {row.row_type === "folder" && expanded && (
                <TRExpandedCellSurface>
                    <div className="p-2 text-xs text-gray-800">
                        <div className="mb-1.5 flex items-center font-medium">
                            <ClosedFolderSvgIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                            <span className="truncate" title={row.label}>
                                {row.label}
                            </span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {folderChildren.map((child, index) => {
                                const document = child.document;
                                return (
                                    <button
                                        key={
                                            child.document_id ??
                                            `deleted-${index}`
                                        }
                                        type="button"
                                        onClick={() => {
                                            if (!document) return;
                                            setExpanded(false);
                                            onDocumentOpen(document);
                                        }}
                                        disabled={!document}
                                        className="flex min-h-7 w-full items-center rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-default"
                                        aria-label={
                                            document
                                                ? `Open ${document.filename}`
                                                : `${child.filename} (deleted)`
                                        }
                                    >
                                        <CornerDownRight
                                            className={`mr-2 h-3.5 w-3.5 shrink-0 ${document ? "text-gray-400" : "text-gray-300"}`}
                                            aria-hidden="true"
                                        />
                                        <FileTypeIcon
                                            fileType={
                                                document?.file_type ??
                                                child.filename
                                            }
                                            className="mr-2 h-3.5 w-3.5"
                                            muted={!document}
                                        />
                                        <span
                                            className={`min-w-0 truncate ${document ? "" : "text-gray-300"}`}
                                            title={
                                                document
                                                    ? document.filename
                                                    : `${child.filename} — the source file has been deleted.`
                                            }
                                        >
                                            {!document && (
                                                <span className="font-medium text-gray-500">
                                                    [Deleted]{" "}
                                                </span>
                                            )}
                                            {document?.filename ??
                                                child.filename}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </TRExpandedCellSurface>
            )}
        </div>
    );
}
