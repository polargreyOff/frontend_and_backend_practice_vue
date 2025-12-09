<template>
  <div class="user-cards">
    <h2>Пример 4: Компоненты и пропсы</h2>
    <UserCard
      :user="adminUser"
      :is-active="true"
      @user-clicked="handleUserClick"
    >
      <template #actions>
        <button @click="editUser(adminUser)" class="btn small">Редактировать</button>
      </template>
      <p>Администратор системы</p>
    </UserCard>

    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
      :is-active="true"
      @user-clicked="handleUserClick"
    />
  </div>
</template>

<script>
import UserCard from './UserCard.vue'

export default {
  name: 'UserCards',
  components: { UserCard },
  data() {
    return {
      adminUser: {
        id: 1,
        name: 'Анна Иванова',
        email: 'anna@example.com',
        role: 'admin'
      },
      users: [
        { id: 2, name: 'Петр Сидоров', email: 'petr@example.com', role: 'user' },
        { id: 3, name: 'Мария Петрова', email: 'maria@example.com', role: 'user' }
      ]
    }
  },
  methods: {
    handleUserClick(user) {
      console.log('Клик по пользователю:', user)
    },
    editUser(user) {
      console.log('Редактирование:', user)
    }
  }
}
</script>

<style scoped>
.user-cards {
  padding: 1.5rem;
}
.btn.small {
  padding: 4px 8px;
  font-size: 0.9rem;
  background-color: #35495e;
}
</style>