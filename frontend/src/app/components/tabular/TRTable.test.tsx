import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TRTable } from "./TRTable";
import type { Document, TabularReviewRow } from "../shared/types";

const row = {
    id: "row-1",
    label: "Contracts",
    row_type: "folder",
    document_id: null,
    source_document_ids: ["doc-1", "doc-2"],
} as TabularReviewRow;
const documents = [
    {
        id: "doc-1",
        filename: "Agreement.pdf",
        file_type: "pdf",
    },
    {
        id: "doc-2",
        filename: "Schedule.docx",
        file_type: "docx",
    },
] as Document[];

function renderTable(
    documentGrouping: "document" | "folder" = "folder",
    tableRows: TabularReviewRow[] = [row],
    onDocumentOpen = vi.fn(),
) {
    const renderResult = render(
        <TRTable
            loading={false}
            documentGrouping={documentGrouping}
            columns={[]}
            rows={tableRows}
            documents={documents}
            cells={[]}
            savingColumn={false}
            savingColumnsConfig={false}
            selectedRowIds={[]}
            onSelectionChange={vi.fn()}
            onDocumentOpen={onDocumentOpen}
            onExpand={vi.fn()}
            onCitationClick={vi.fn()}
            onUpdateColumn={vi.fn()}
            onDeleteColumn={vi.fn()}
            onAddColumn={vi.fn()}
            onAddDocuments={vi.fn()}
        />,
    );
    return { ...renderResult, onDocumentOpen };
}

describe("TRTable", () => {
    // The grid here is div-based (no table/columnheader/rowheader roles), so
    // this asserts on rendered content rather than ARIA table semantics.
    it("renders one table row for a grouped folder", () => {
        renderTable();
        expect(screen.getByText("Folder / Document")).toBeInTheDocument();
        expect(screen.getByText("Contracts")).toBeInTheDocument();
        // One select-all checkbox in the header plus one per logical review row.
        expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    });

    it("uses Document as the header for document grouping", () => {
        renderTable("document");
        expect(screen.getByText("Document")).toBeInTheDocument();
        expect(
            screen.queryByText("Folder / Document"),
        ).not.toBeInTheDocument();
    });

    it("expands a folder row to list its source documents", () => {
        const { onDocumentOpen } = renderTable();
        fireEvent.click(screen.getByText("Contracts"));
        expect(screen.getByText("Agreement.pdf")).toBeInTheDocument();
        expect(screen.getByText("Schedule.docx")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Open Agreement.pdf" }),
        );
        expect(onDocumentOpen).toHaveBeenCalledWith(row, documents[0]);
    });

    it("marks a row whose document was deleted and keeps its cell content", () => {
        const deletedRow = {
            ...row,
            id: "row-deleted",
            label: "Gone.pdf",
            row_type: "document",
            document_id: null,
            source_document_ids: [],
            source_documents: [
                { document_id: null, filename: "Gone.pdf", deleted: true },
            ],
            is_deleted: true,
        } as TabularReviewRow;
        const { onDocumentOpen } = renderTable("document", [deletedRow]);

        // House convention for a deleted file: "[Deleted]" prefix, greyed name.
        expect(screen.getByText("[Deleted]")).toBeInTheDocument();
        expect(screen.getByTitle(/the source file has been deleted/)).toHaveTextContent(
            "[Deleted] Gone.pdf",
        );
        // The row stays selectable so it can be removed.
        expect(
            screen.getByRole("checkbox", { name: "Select Gone.pdf" }),
        ).toBeInTheDocument();

        const nameButton = screen.getByRole("button", {
            name: "Gone.pdf (deleted)",
        });
        expect(nameButton).toBeDisabled();
        fireEvent.click(nameButton);
        expect(onDocumentOpen).not.toHaveBeenCalled();
    });

    it("lists a deleted child inside a folder row from its snapshot name", () => {
        const folderRow = {
            ...row,
            source_document_ids: ["doc-1"],
            source_documents: [
                { document_id: "doc-1", filename: "Agreement.pdf", deleted: false },
                { document_id: null, filename: "Removed.pdf", deleted: true },
            ],
            is_deleted: false,
        } as TabularReviewRow;
        const { onDocumentOpen } = renderTable("folder", [folderRow]);

        fireEvent.click(screen.getByText("Contracts"));
        expect(screen.getByText("Agreement.pdf")).toBeInTheDocument();
        const deletedChild = screen.getByRole("button", {
            name: "Removed.pdf (deleted)",
        });
        expect(deletedChild).toBeDisabled();
        fireEvent.click(deletedChild);
        expect(onDocumentOpen).not.toHaveBeenCalled();
    });

    it("opens a standalone document row from its document name", () => {
        const documentRow = {
            ...row,
            label: "Agreement.pdf",
            row_type: "document",
            document_id: "doc-1",
            source_document_ids: ["doc-1"],
        } as TabularReviewRow;
        const { onDocumentOpen } = renderTable(
            "document",
            [documentRow],
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open Agreement.pdf" }),
        );

        expect(onDocumentOpen).toHaveBeenCalledWith(
            documentRow,
            documents[0],
        );
    });
});
