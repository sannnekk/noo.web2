import App from '@/App.vue'
import { registerModules } from '@/modules-registrar'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

// css
import 'animate.css'

// adding modules
import AssignedWorksModule from '@/modules/assigned-works'
import AuthModule from '@/modules/auth'
import CalendarModule from '@/modules/calendar'
//import CourseStudentsModule from '@/modules/course-students'
import CoursesModule from '@/modules/courses'
//import CreateCourseModule from '@/modules/create-course'
//import CreateWorkModule from '@/modules/create-work'
//import HelpModule from '@/modules/help'
import NooTubeModule from '@/modules/nootube'
import PollsModule from '@/modules/polls'
//import ProfileModule from '@/modules/profile'
//import SettingsModule from '@/modules/settings'
//import TablesModule from '@/modules/tables'
import UsersModule from '@/modules/users'
import WorksModule from '@/modules/works'

const app = createApp(App)

const { router } = registerModules([
  AssignedWorksModule,
  AuthModule,
  CalendarModule,
  //CourseStudentsModule,
  CoursesModule,
  //CreateCourseModule,
  //CreateWorkModule,
  //HelpModule,
  NooTubeModule,
  PollsModule,
  //ProfileModule,
  //SettingsModule,
  //TablesModule,
  UsersModule,
  WorksModule
])

// adding plugins
app.use(router)
app.use(createPinia())

// mounting the app
app.mount('#root')
