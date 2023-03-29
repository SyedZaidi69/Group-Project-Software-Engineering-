import { getCountries, getCountryOptions } from "../db.mjs";
import prisma from "../client.mjs";
import { jest, expect } from "@jest/globals";

test("Should set continent filter to Africa", () => {
  const options = {
    continent: "Africa",
  };
  const res = getCountryOptions(options);
  expect(res).toBeDefined();
  expect(res.where).toBeDefined();
  expect(res.where.Continent.equals).toBe("Africa");
});

test("Should reset continent filter to Asia", () => {
  const res = getCountryOptions({
    continent: "Invalid_Continent",
  });
  expect(res).toBeDefined();
  expect(res.where.Continent.equals).toBe("Asia");
});

test("Should set limit to 10", () => {
  const res = getCountryOptions({
    limit: 10,
  });
  expect(res.take).toBe(10);
});

test("Should not set limit", () => {
  const res = getCountryOptions({
    limit: -420,
  });
  expect(res.take).toBeUndefined();
});

test("Region should not set to invalid value", () => {
  const res = getCountryOptions({
    region: "reigongsd",
  });
  expect(res).toBeDefined();
  expect(res.where.Region.equals).toBeDefined();
});