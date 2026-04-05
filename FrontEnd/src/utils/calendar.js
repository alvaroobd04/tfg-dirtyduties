
export function groupByDay(executions)
{
  const grouped = {};

  executions.forEach((execution) => {
    const key = execution.fecha.split("T")[0];

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(execution);
  });

  return grouped;
}

export function generateCalendarGrid(year, month) 
{
  const firstDay = new Date(year, month, 1);

  // lunes = 0
  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  //huecos antes del día 1
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // días reales
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    days.push({
      date,
      dayNumber: d,
    });
  }

  return days;
}