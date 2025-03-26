"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import Loading from "../loading";
import TableNavigation from "../_components/table-navigation";
import { useSearchParams } from "next/navigation";
import { getOrganizations, Organization, Timeframe } from "./_actions/data";
import { formatPrice } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrganizationsPage() {
  const page = Number(useSearchParams().get("page") ?? "1");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getOrganizations(timeframe)
      .then((org) => setOrgs(org))
      .finally(() => setIsLoading(false));
  }, [timeframe]);

  return (
    <div className="h-full flex flex-col justify-between pb-6 px-4">
      <div className="space-y-4 h-full">
        <div className="flex justify-between">
          <p className="text-xl font-semibold">Customers</p>
          <Select
            value={timeframe}
            onValueChange={(e) => setTimeframe(e as Timeframe)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Timeframe</SelectLabel>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {isLoading ? <Loading /> : <OrganizationsTable organizations={orgs} />}
      </div>
      <TableNavigation
        page={page}
        total={orgs.length}
        route="/admin/customers"
      />
    </div>
  );
}

type OrganizationsTableProps = {
  organizations: Organization[];
};

function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Promo Code</TableHead>
          <TableHead>Sales Count</TableHead>
          <TableHead>Total Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.map((org) => (
          <TableRow key={org.id}>
            <TableCell>{org.id}</TableCell>
            <TableCell>{org.sales.length}</TableCell>
            <TableCell>
              {formatPrice(
                org.sales.reduce(
                  (acc, sale) => acc + sale.pricePaidInPennies,
                  0
                )
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
