import SysVariables from '#models/sys_variable'

export default class DistanceService {
  static async calculate(accommodationLat: number, accommodationLng: number) {
    
    // Get UPLB reference point from sys_variables
    const sys = await SysVariables.firstOrFail()
    const token = process.env.MAPBOX_TOKEN
    const origin = `${accommodationLng},${accommodationLat}`
    const destination = `${sys.uplbLongitude},${sys.uplbLatitude}`

    // Helper to fetch duration in minutes
    interface MapboxRouteResponse {
    routes: {
        duration: number
    }[]
    }

    const getMinutes = async (profile: string) => {
    const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin};${destination}?access_token=${token}`
    )

    const data = await res.json() as MapboxRouteResponse

    if (!data.routes?.[0]) return null
    return Math.round(data.routes[0].duration / 60)
    }

    const [walkingMinutes, drivingMinutes, cyclingMinutes] = await Promise.all([
      getMinutes('walking'),
      getMinutes('driving'),
      getMinutes('cycling'),
    ])

    return { walkingMinutes, drivingMinutes, cyclingMinutes }
  }
}