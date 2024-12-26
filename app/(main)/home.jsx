import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icons from "../../assets/Icons";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { supabase } from "../../lib/supabase";
import { getUserData } from "../../services/userService";

let limit = 0;

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handlePostEvent = async (payload) => {
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
  };

  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    // getPosts();

    return () => {
      supabase.removeChannel(postChannel);
    };
  }, []);

  const getPosts = async () => {
    //Call the API here
    if (!hasMore) return null;
    limit += 4;

    console.log("Fetching posts", limit);
    let res = await fetchPosts(limit);
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  const headerTransform = scrollY.interpolate({
    inputRange: [0, hp(10)],
    outputRange: [1, 0], // Scale down as user scrolls
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, hp(10)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ scaleY: headerTransform }],
              opacity: headerOpacity,
            },
          ]}
        >
          <Text style={styles.title}>Looply</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push("notifications")}>
              <Icons name="heart" />
            </Pressable>
            <Pressable onPress={() => router.push("newPost")}>
              <Icons name="plus" />
            </Pressable>
            <Pressable onPress={() => router.push("profile")}>
              <Avatar
                uri={user?.image}
                size={hp(3.4)}
                rounded={theme.radius.round}
                style={{ borderWidth: 1 }}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Posts List */}
        <Animated.FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user} router={router} />
          )}
          onEndReached={() => {
            getPosts();
            console.log("End of the Post Section");
          }}
          onEndReachedThreshold={0}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No More Posts</Text>
              </View>
            )
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    backgroundColor: "white",
    zIndex: 1,
    overflow: "hidden",
  },
  title: {
    color: theme.colors.text || "black",
    fontSize: hp(3.6),
    fontWeight: theme.fonts.bold,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
  },
  listStyle: {
    paddingTop: hp(6), // Ensures content starts below the header
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(1.56),
    textAlign: "center",
    top: 10,
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
});
