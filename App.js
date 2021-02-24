// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import * as firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB0IJt-ZHrr2RCIz4xXXErFeE9Fk5_Msu4",
  authDomain: "fire-chat-1254c.firebaseapp.com",
  projectId: "fire-chat-1254c",
  storageBucket: "fire-chat-1254c.appspot.com",
  messagingSenderId: "780811305207",
  appId: "1:780811305207:web:afd79f90e9896d110193f2",
  measurementId: "G-3V4B6MN7L0"
};

if(firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// LogBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')


export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])
  useEffect(() => {
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messageFirestore = querySnapshot
                                  .docChanges()
                                  .filter(({type}) => type === 'added')
                                  .map(({doc}) => {
                                    const message = doc.data()
                                    return { ... message, createdAt: message.createdAt.toDate() }
                                  })
                                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getItem() )
      appendMessages(messageFirestore)
    })
    return () => unsubscribe()
  }, [])
  
  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser() {
    const user = await AsyncStorage.getItem('user')
    if(user) {
      setUser(JSON.parse(user))
    }
  }
  if(!user) {
    return (
      <View style={styles.container}>
        <TextInput 
          style={styles.input}
          placeholder='Enter your name'
          value={name}
          onChangeText={setName}
        />
        <Button 
          title='Enter the chat'
          onPress={handlePress}
        />
      </View>
    )
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7)
    const user = { _id, name }
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  async function handleSend(messages) {
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }

  return (
      <GiftedChat 
        messages={messages}
        user={user}
        onSend={handleSend}
      />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 50,
    marginBottom: 20,
    borderColor: 'gray',
    color: 'black'
  }
});
