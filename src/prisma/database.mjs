import Prisma from "@prisma/client";
const { country_Continent } = Prisma;

//export const prisma = new PrismaClient();
import prisma from "./client.mjs";

/* 
  Handles parameters for retrieving countries.
  Receives an options object with HTTP parameters.
  Validates param values / sets defaults when needed.
  Transforms that object into Prisma-compatible query options.
*/
export function getCountryOptions(options) {
  // Extract options
  let { limit, continent, region, sortby } = options;

  // Validate limit value (if it's set)
  if (limit) {
    limit = parseInt(limit);
    if (limit <= 0) {
      console.log(
        `GetCountries: Invalid limit value: ${limit}; unsetting limit.`
      );
      limit = undefined;
    }
  }

  // Valid continent values
  const continents = Object.values(country_Continent);

  // Sanity check for invalid continent (if set)
  if (continent && !continents.includes(continent)) {
    const defaultContinent = continents[0];
    console.log(
      `GetQueryOptions: Invalid continent '${continent}', setting to default (${defaultContinent})`
    );
    continent = defaultContinent;
  }

  // Define column sorting based on sortby parameter
  let orderBy = {};
  switch (sortby) {
    case "Pop_Asc":
      orderBy = {
        Population: "asc",
      };
      break;

    case "Pop_Desc":
      orderBy = {
        Population: "desc",
      };
      break;

    default:
      orderBy = {
        Population: "desc",
      };
      break;
  }

  return {
    // Default sorting: by population, descending
    orderBy,
    where: {
      // If a continent filter is set, filter to only get countries from that continent
      ...(continent && { Continent: { equals: continent } }),
      // Same filter for region
      ...(region && { Region: { equals: region } }),
    },
    // Similarily, only get the top <limit> records if a limit is set
    ...(limit && { take: limit }),
  };
}

/*
 * Universal method to retrieve countries from the database.
 * Allows filters, sorting modes and limits to be set via the options object.
 */
export async function getCountries(options) {
  console.log("GetCountries: Retrieving countries", options);

  const opts = getCountryOptions(options);

  // Build and execute the countries query
  const res = await prisma.country.findMany({
    // Get all cities related to this country
    include: {
      city: true,
    },
    // Expand transformed options for Prisma to use
    ...opts,
  });

  // Find the capital city for each country, and asign that object to `Capital` field
  res.map((country) => {
    const capitalId = country.Capital;
    const capital = country.city.find((c) => c.ID === capitalId);
    country.CapitalCity = capital;
    return country;
  });

  return res;
}

/*
 * Method to retrieve all cities
 * or filter/sort by specific columns
 */
export async function getCities(options) {
  console.log("GetCities", options);
  // Remove limit from options and store it separately
  // This is done because we want to apply the limit to cities, not countries
  // Also extract capital-only bool param
  const { limit, capital, district, country, ...opts } = options;
  // Fetch countries and their cities (also pass all the other filters and stuff)
  const countries = await getCountries(opts);
  // Collect cities from countries based on filters
  const cities = countries.reduce((res, c) => {
    let toAdd = [];

    // Country filter
    if (country && country !== c.Code) {
      // Skip this country if codes don't match
      return res;
    }

    // Capital city filter
    if (capital && c.CapitalCity) {
      // Only add capital cities
      toAdd = [c.CapitalCity];
    } else if (!capital) {
      // Add all cities from each country
      toAdd = c.city;
    }

    // District filter
    toAdd = toAdd.filter((c) => {
      if (district && c.District !== district) {
        return false;
      }
      return true;
    });

    // Append processed cities to results
    res = [...res, ...toAdd];

    return res;
  }, []);

  // At this point column-based filters are applied.
  // Store the cities in a mutable variable for further transformations.
  let res = cities;

  // Sort cities based on 'sortby' param
  res.sort((a, b) => {
    let diff = a.Population - b.Population;
    switch (options.sortby) {
      case "Pop_Asc":
        return diff;

      case "Pop_Desc":
        return -diff;

      default:
        return -diff;
    }
  });

  // Apply limit if set
  if (limit && limit > 0) {
    res = cities.splice(0, limit);
  }

  // Return!
  return res;
}

export async function LivingInCities(options) {
  let res = await getCountries(options);
  let pop = 0;
  res.forEach((country) => {
    let countryPopulation = country.city.reduce((total, city) => {
      total += city.Population;
      return total;
    }, 0);
    let notLivingInCitiesPop = country.Population - countryPopulation;
    console.log(
      "Total population of people living in cities: ",
      country.Name,
      countryPopulation
    );
    console.log(
      "Total country not living in cities pop: ",
      country.Name,
      notLivingInCitiesPop
    );
  });
  return pop;
}

export async function getPopulation(options) {
  const { district, ...opts } = options;
  let res = await getCountries(opts);
  let population = 0;
  for (let country of res) {
    if (!country.Population) {
      continue;
    }

    if (district) {
      population += country.city.reduce((total, city) => {
        if (!city.Population || (district && city.District !== district)) {
          return total;
        }
        total += city.Population;
        return total;
      }, 0);
    } else {
      population += country.Population;
    }
  }
  return population;
}