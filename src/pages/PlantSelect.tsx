import { useNavigation } from "@react-navigation/native";
import React from "react"
import { useState } from "react";
import { useEffect } from "react";
import { Text, View, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native'
import { EnviromentButton } from "../components/EnviromentButton";
import { Header } from "../components/Header";
import { Load } from "../components/Load";
import { PlantCardPrimary } from "../components/PlantCardPrimary";
import { PlantProps } from "../libs/storage";
import api from "../services/api";
import colors from "../styles/colors";
import fonts from "../styles/fonts";


interface EnviromentProps {
    key: string;
    title: string;
}


export function PlantSelect() {
    const [enviroments, setEnviroments] = useState<EnviromentProps[]>([]);
    const [plants, setPlants] = useState<PlantProps[]>([]);
    const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
    const [environmentSelected, setEnvironmentSelected] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const navigation = useNavigation();

    function handleEnvironmentSelected(environment: string) {
        setEnvironmentSelected(environment);

        if (environment === "all") return setFilteredPlants(plants);

        const filtered = plants.filter(plant =>
            plant.environments.includes(environment)
        );

        setFilteredPlants(filtered);
    }

    async function fetchPlants() {
        const { data } = await api.get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

        if (!data) return setIsLoading(true);
        if (page > 1) {
            setPlants(oldValue => [...oldValue, ...data])
            setFilteredPlants(oldValue => [...oldValue, ...data])
        } else {
            setPlants(data);
            setFilteredPlants(data);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
    }

    function handleFetchMore(distance: number) {
        if (distance < 1) return

        setIsLoadingMore(true);
        setPage(oldValue => oldValue + 1);

        fetchPlants();
    }

    function handlePlantSelect(plant: PlantProps) {
        navigation.navigate('PlantSave', { plant });
    }

    useEffect(() => {
        async function fetchEnviroment() {
            const { data } = await api.get("plants_environments?_sort=title&_order=asc");
            setEnviroments([
                {
                    key: 'all',
                    title: "Todos",
                },
                ...data
            ]);
        }
        fetchEnviroment();
    }, [])

    useEffect(() => {
        fetchPlants();
    }, [])


    if (isLoading) return <Load />
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Header />
                <Text style={styles.title}>Em qual ambiente</Text>
                <Text style={styles.subtitle}>voce quer colocar a sua planta?</Text>
            </View>

            <View style={styles.enviromentList} >
                <FlatList data={enviroments} keyExtractor={(item) => String(item.key)} renderItem={({ item }) => (
                    <EnviromentButton title={item.title} active={item.key === environmentSelected} onPress={() => handleEnvironmentSelected(item.key)} />
                )} horizontal showsHorizontalScrollIndicator={false} />
            </View>

            <View style={styles.plants}>
                <FlatList data={filteredPlants} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => (
                    <PlantCardPrimary data={item} onPress={() => handlePlantSelect(item)} />
                )} showsHorizontalScrollIndicator={false} numColumns={2} onEndReachedThreshold={0.1}
                    onEndReached={({ distanceFromEnd }) => handleFetchMore(distanceFromEnd)}
                    ListFooterComponent={isLoadingMore ? <ActivityIndicator color={colors.green} /> : <></>} />
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        width: "100%",
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 17,
        color: colors.heading,
        fontFamily: fonts.heading,
        lineHeight: 20,
        marginTop: 15
    },
    subtitle: {
        fontFamily: fonts.text,
        fontSize: 17,
        lineHeight: 20,
        color: colors.heading
    },
    enviromentList: {
        height: 40,
        justifyContent: "center",
        marginLeft: 32,
        marginVertical: 25,
    },
    plants: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: "center"
    }
})