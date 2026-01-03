// hooks/useCountries.ts
import { getData } from 'country-list'

export const useCountries = () => {
  const countries = getData().map(country => ({
    name: country.name,
    code: country.code
  }))

  return countries
}
