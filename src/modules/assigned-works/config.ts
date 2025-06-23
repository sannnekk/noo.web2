export const AssignedWorkConfig = {
  /**
   * The number of days to shift a solve deadline
   */
  solveDeadlineShift: 3,
  solveDeadlineShiftText: '3 дня',
  /**
   * The number of days to shift a check deadline when the solve deadline is shifted
   */
  checkDeadlineShiftWhileSolveDeadlineShift: 14,
  /**
   * The number of days to shift a check deadline
   */
  checkDeadlineShift: 3,
  checkDeadlineShiftText: '3 дня'
} as const
