import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux'
import { createStore, combineReducers } from 'redux';

// reducer structure:
// todoApp
// - todos
//   - todo
// - visibilityFilter

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
}

// this was old root reducer!
const todos = (state = [], action) => {
  switch (action.type) {
    // Adds Todos
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    // Toggles Todos
    case 'TOGGLE_TODO':
      // Iterate through every todo item in the array and runs 
      // the todo() function and returns a new array
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

// visibility filter reducer
const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

// root reducer
const todoApp = combineReducers({
  // todos: todos
  todos,
  // visibilityFilter: visibilityFilter
  visibilityFilter
})

// Link Component
const Link = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>
  }
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  )
}

// FilterLink Component
class FilterLink extends Component {
  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {

    const props = this.props;
    const { store } = this.context;
    const state = store.getState();

    return (
      <Link
        active={
          props.filter === state.visibilityFilter
        }
        onClick={() =>
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        }
      >
        {props.children}
      </Link>
    )
  }
}
FilterLink.contextTypes = {
  store: PropTypes.object
};

// 'Presentational' Todo Component
const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}

    style={{
      textDecoration: completed
        ? 'line-through'
        : 'none'
    }}

  >
    {text}
  </li>
);

// 'Presentational TodoList Component. It 'contains' the Todo Components.
const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ul>
);

const AddTodo = (props, { store }) => {
  let input;

  return (
    <div>
      <input ref={node => {
        input = node;
      }} />
      <button onClick={() => {
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        })
        input.value = '';
      }}>
        Add Todo
        </button>
    </div>
  )
}
AddTodo.contextTypes = {
  store: PropTypes.object
};

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'
    >
      All
    </FilterLink>
    {', '}
    <FilterLink
      filter='SHOW_ACTIVE'
    >
      Active
    </FilterLink>
    {', '}
    <FilterLink
      filter='SHOW_COMPLETED'
    >
      Completed
    </FilterLink>
  </p>
)

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      );
  }
}

const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch({
        type: 'TOGGLE_TODO',
        id
      })
    }
  }
}

const VisibleTodoList = connect(
  mapStateToProps, mapDispatchToProps
)(TodoList)

let nextTodoId = 0;

// refactored the entire app into just a single expression
const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)

// Store is now injected into all components for ease of access to store and testing
ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);