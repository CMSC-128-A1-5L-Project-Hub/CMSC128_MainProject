export interface SysVariable {
  id: number

  currentSemester: 'first_sem' | 'second_sem' | 'midyear'
  currentSy: string

  semStartDate: string

  uplbLatitude: number
  uplbLongitude: number

  autoVerifyUsers: boolean
}