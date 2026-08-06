import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

// Sempre dentro do contêiner com overflow-x auto — tabelas de razão (notas,
// exames, lançamentos) tendem a ganhar colunas e não podem quebrar o layout
// da tela num aparelho estreito.
export function Table({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-[var(--line-soft)]">
      <table
        className={`w-full min-w-[470px] border-collapse text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableFoot(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot {...props} />;
}

export function TableRow({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`[&>td]:border-b [&>td]:border-[var(--line-soft)] last:[&>td]:border-b-0 hover:bg-[var(--surface-2)] ${className}`}
      {...props}
    />
  );
}

export function TableHeadCell({
  numeric = false,
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      className={`whitespace-nowrap border-b border-[var(--line)] bg-[var(--surface-2)] px-[14px] py-[11px] font-mono text-[10px] font-medium tracking-[0.12em] text-[var(--muted-2)] uppercase ${
        numeric ? "text-right" : "text-left"
      } ${className}`}
      {...props}
    />
  );
}

export function TableCell({
  numeric = false,
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={`px-[14px] py-[11px] align-middle ${
        numeric ? "text-right font-mono whitespace-nowrap tabular-nums" : ""
      } ${className}`}
      {...props}
    />
  );
}

export function TableFootCell({
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`border-t border-[var(--line)] bg-[var(--surface-2)] px-[14px] py-[11px] font-semibold ${className}`}
      {...props}
    />
  );
}
