import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Alert,
} from "react-native";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { database } from "./config/firebase";
import Icon from "react-native-vector-icons/FontAwesome";

export default function TaskDetail({ route }) {
    const { taskId, userId } = route.params;
    const [task, setTask] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [note, setNote] = useState("");
    const [timeLog, setTimeLog] = useState({ startTime: "", endTime: "" });

    useEffect(() => {
        fetchTaskDetails();
    }, []);

    const fetchTaskDetails = async () => {
        try {
            const taskRef = doc(database, "tasks", taskId);
            const taskDoc = await taskRef.get();
            if (taskDoc.exists) {
                setTask(taskDoc.data());
                setComments(taskDoc.data().comments || []);
                setNote(taskDoc.data().note || "");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch task details.");
        }
    };

    const updateNote = async () => {
        try {
            const taskRef = doc(database, "tasks", taskId);
            await updateDoc(taskRef, { note });
        } catch (error) {
            Alert.alert("Error", "Failed to update note.");
        }
    };

    const addComment = async () => {
        if (newComment) {
            const comment = {
                text: newComment,
                userId,
                timestamp: new Date(),
            };
            try {
                await addDoc(collection(database, `tasks/${taskId}/comments`), comment);
                setComments([...comments, comment]);
                setNewComment("");
            } catch (error) {
                Alert.alert("Error", "Failed to add comment.");
            }
        }
    };

    const logTime = async () => {
        // Log time spent on task logic here
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.header}>Task Details</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Notes</Text>
                    <TextInput
                        style={styles.input}
                        multiline
                        placeholder="Add a note"
                        value={note}
                        onChangeText={setNote}
                        onBlur={updateNote}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Comments</Text>
                    {comments.map((comment, index) => (
                        <View key={index} style={styles.commentItem}>
                            <Text style={styles.commentText}>{comment.text}</Text>
                            <Text style={styles.commentMeta}>
                                {comment.userId} - {new Date(comment.timestamp).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment"
                        value={newComment}
                        onChangeText={setNewComment}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addComment}>
                        <Text style={styles.addButtonText}>Add Comment</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Time Log</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Start Time"
                        value={timeLog.startTime}
                        onChangeText={(value) => setTimeLog({ ...timeLog, startTime: value })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="End Time"
                        value={timeLog.endTime}
                        onChangeText={(value) => setTimeLog({ ...timeLog, endTime: value })}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={logTime}>
                        <Text style={styles.addButtonText}>Log Time</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.bottomBox}>
                <Text style={styles.boxText}>
                    Copyright © 2024 Novozymes A/S, part of Novonesis Group
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 20,
        paddingTop: 80,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#ededed",
        color: "#000000",
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#173630",
        borderRadius: 5,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    commentItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#f1f1f1",
        borderRadius: 5,
    },
    commentText: {
        fontSize: 14,
        color: "#333",
    },
    commentMeta: {
        fontSize: 12,
        color: "#999",
        marginTop: 5,
    },
    bottomBox: {
        width: "100%",
        height: 60,
        backgroundColor: "#173630",
        justifyContent: "center",
        alignItems: "center",
    },
    boxText: {
        color: "#fff",
        fontSize: 14,
        lineHeight: 16,
        textAlign: "center",
    },
});
