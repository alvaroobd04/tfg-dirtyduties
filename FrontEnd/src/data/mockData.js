export function createInitialHouses() {
  return {
    'Casa Salamanca': {
      people: ['Tú', 'Lucía'],
      tasks: [
        { text: 'Limpiar cocina', assignee: 'Tú', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Sacar la basura', assignee: 'Lucía', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Aspirar el salón', assignee: 'Tú', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Lavar los platos', assignee: 'Lucía', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Regar las plantas', assignee: 'Tú', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Limpiar el baño', assignee: 'Lucía', completed: false, deadline: '2025-05-07', flagged: false }
      ],
      userTasks: [],
      punishments: [
        {
          user: 'Tú',
          taskText: 'Fregar el suelo',
          reason: 'No haber limpiado la casa a tiempo',
          completed: false,
          originalTask: 'Limpiar cocina',
          originalDeadline: '2025-05-07',
          assignedDate: '2025-05-08'
        },
        {
          user: 'Tú',
          taskText: 'Limpiar ventanas',
          reason: 'No haber sacado la basura a tiempo',
          completed: false,
          originalTask: 'Sacar la basura',
          originalDeadline: '2025-05-06',
          assignedDate: '2025-05-07'
        }
      ]
    },
    'Casa del Pueblo': {
      people: ['Tú', 'Pedro', 'María'],
      tasks: [
        { text: 'Barrer el patio', assignee: 'Tú', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Limpiar ventanas', assignee: 'Pedro', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Cortar el césped', assignee: 'María', completed: false, deadline: '2025-05-07', flagged: false },
        { text: 'Lavar ropa', assignee: 'Tú', completed: false, deadline: '2025-05-07', flagged: false }
      ],
      userTasks: [],
      punishments: []
    }
  }
}
