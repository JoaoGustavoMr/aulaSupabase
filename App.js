// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Cadastro from './screens/Cadastro';
import Login from './screens/Login';
import Home from './screens/Home';
import ListarVideos from './screens/ListarVideos';
import UploadVideos from './screens/UploadVideos';
import ListarImagens from './screens/ListarImagens';
import UploadImagens from './screens/UploadImagens';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: 'Cadastro' }} />
        <Stack.Screen name="Login" component={Login} options={{ title: 'Entrar' }} />
        <Stack.Screen name="Home" component={Home} options={{ title: 'Bem-vindo' }} />
        <Stack.Screen name="ListarVideos" component={ListarVideos} options={{ title: 'Listar Vídeos' }} />
        <Stack.Screen name="UploadVideos" component={UploadVideos} options={{ title: 'Upload Vídeo' }} />
        <Stack.Screen name="ListarImagens" component={ListarImagens} options={{ title: 'Listar Imagens' }} />
        <Stack.Screen name="UploadImagens" component={UploadImagens} options={{ title: 'Upload Imagem' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
