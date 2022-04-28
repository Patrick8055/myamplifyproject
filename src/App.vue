<template>
  <div id="app">
    <div v-if="authState !== 'signedin'">You are signed out.</div>
    <amplify-authenticator>
      <div v-if="authState === 'signedin' && user">
        <h1>Todo App</h1>
        <input type="text" v-model="name" placeholder="Todo name" />
        <input
          type="text"
          v-model="description"
          placeholder="Todo description"
        />
        <button v-on:click="createTodo">Create Todo</button>
        <div v-for="item in todos" :key="item.id">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
      <amplify-sign-out></amplify-sign-out>
    </amplify-authenticator>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { onCreateTodo } from "./graphql/subscriptions";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";

export default {
  name: "App",
  async created() {
    this.getTodos();
    this.subscribe();
    this.unsubscribeAuth = onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData;
    });
  },
  data() {
    return {
      name: "",
      description: "",
      todos: [],
      user: undefined,
      authState: undefined,
      unsubscribeAuth: undefined,
    };
  },
  methods: {
    async createTodo() {
      const { name, description } = this;
      if (!name || !description) return;
      const todo = { name, description };
      this.todos = [...this.todos, todo];
      await API.graphql({
        query: createTodo,
        variables: { input: todo },
      });
      this.name = "";
      this.description = "";
    },
    async getTodos() {
      const todos = await API.graphql({
        query: listTodos,
      });
      this.todos = todos.data.listTodos.items;
    },
    subscribe() {
      API.graphql({ query: onCreateTodo }).subscribe({
        next: (eventData) => {
          let todo = eventData.value.data.onCreateTodo;
          if (this.todos.some((item) => item.name === todo.name)) return; // remove duplications
          this.todos = [...this.todos, todo];
        },
      });
    },
  },
  beforeDestroy() {
    this.unsubscribeAuth();
  },
};
</script>
