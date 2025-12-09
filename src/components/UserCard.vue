<template>
  <div class="user-card" :class="user.role">
    <h3>{{ user.name }}</h3>
    <p>Email: {{ user.email }}</p>
    <p>Роль: {{ user.role }}</p>
    <p>Статус: {{ isActive ? 'Активен' : 'Неактивен' }}</p>
    <slot name="actions"></slot>
    <slot><p>Нет дополнительной информации</p></slot>
  </div>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    user: {
      type: Object,
      required: true,
      validator: (value) => value.name && value.email
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  emits: ['user-clicked'],
  methods: {
    handleClick() {
      this.$emit('user-clicked', this.user)
    }
  }
}
</script>

<style scoped>
.user-card {
  border: 1px solid #ddd;
  padding: 16px;
  margin: 10px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.user-card.admin {
  border-left: 4px solid #ff6b6b;
  background-color: #fff5f5;
}
.user-card.user {
  border-left: 4px solid #42b883;
  background-color: #f0fff4;
}
</style>