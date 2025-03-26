"use server";

import db from "@/db/db";
import { Sale } from "@prisma/client";

export type Timeframe = "week" | "month" | "year" | "all";

export type Organization = {
  id: string;
  sales: Sale[];
};

function getCreatedAtFilter(timeframe: Timeframe) {
  switch (timeframe) {
    case "week":
      return {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    case "month":
      return {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    case "year":
      return {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      };
    case "all":
      return {};
  }
}

export async function getOrganizations(timeframe: Timeframe) {
  const createdAt = getCreatedAtFilter(timeframe);
  const sales = await db.sale.findMany({
    where: {
      couponCode: {
        not: null,
      },
      createdAt,
    },
  });
  const organizations: Organization[] = [];
  for (const sale of sales) {
    const organization = organizations.find(
      (org) => org.id === sale.couponCode
    );
    if (organization) {
      organization.sales.push(sale);
    } else {
      if (!sale.couponCode) continue;
      organizations.push({
        id: sale.couponCode,
        sales: [sale],
      });
    }
  }
  return organizations;
}
