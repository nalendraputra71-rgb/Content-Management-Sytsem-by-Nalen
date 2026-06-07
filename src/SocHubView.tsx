import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDoc, where, limit } from "./firebase";
import { Heart, MessageCircle, Repeat2, Share, Send, MoreHorizontal, MessageSquare, ArrowLeft, Image as ImageIcon, Home, PlusSquare, User as UserIcon, Bell, BarChart2, ChevronDown, Trash2, Edit2, Archive as ArchiveIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as dfnsId } from "date-fns/locale";

function getAvatar(profile: any, id: string) {
  if (profile?.uid === id && profile?.avatar) return profile.avatar;
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${id}&backgroundColor=ffffff`;
}

function NavButton({ icon: Icon, active, onClick, label, badge }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-none cursor-pointer transition-all duration-200 whitespace-nowrap min-w-max hover:bg-gray-100 ${active ? 'bg-gray-100 text-gray-900' : 'bg-transparent text-gray-500'}`}>
      <div className="relative shrink-0">
        <Icon size={20} strokeWidth={active ? 2.5 : 2} className="sm:w-[22px] sm:h-[22px]" />
        {badge > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</div>}
      </div>
      <span className={`text-sm sm:text-[15px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  );
}

function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(#\w+|@\w+|https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('#')) {
          return <span key={i} className="text-[var(--theme-primary)] hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>{part}</span>;
        }
        if (part.startsWith('@')) {
          return <span key={i} className="text-[var(--theme-primary)] font-semibold hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>{part}</span>;
        }
        if (part.match(/^https?:\/\/[^\s]+/)) {
          return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline" onClick={e => e.stopPropagation()}>{part}</a>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function PostItem({ post, currentUser, onReply, onLike, onRepost, onShare, onProfile, onVote, onOpenPost, onDelete, onEdit, onArchive }: any) {
  const isLiked = post.likes?.includes(currentUser.uid);
  const isReposted = post.reposts?.includes(currentUser.uid);
  const [showMenu, setShowMenu] = useState(false);
  const isMe = currentUser?.uid === post.authorId;

  return (
    <div onClick={(e) => { e.stopPropagation(); if (onOpenPost) onOpenPost(post); }} className={`p-4 sm:p-6 rounded-3xl bg-white shadow-sm mb-5 transition-transform duration-100 ${onOpenPost ? 'cursor-pointer' : 'cursor-default'}`}>
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer shrink-0 min-w-0" onClick={(e) => { e.stopPropagation(); onProfile(post.authorId); }}>
           <img src={post.authorAvatar || getAvatar(null, post.authorId)} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-100 object-cover shrink-0" />
           <div className="min-w-0 flex flex-col justify-center">
             <div className="font-bold text-sm sm:text-base text-gray-900 flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1.5 leading-snug">
               <span className="truncate">{post.authorName}</span> <span className="text-gray-400 text-xs sm:text-sm font-normal truncate">@{post.authorUsername}</span>
             </div>
             <div className="text-[11px] sm:text-[13px] text-gray-400">
               {post.createdAt?.toMillis ? formatDistanceToNow(post.createdAt.toMillis(), { addSuffix: true, locale: dfnsId }) : 'Baru saja'}
             </div>
           </div>
        </div>
        <div className="relative shrink-0 ml-2">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-full hover:bg-gray-100">
            <MoreHorizontal size={20} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="absolute right-0 top-10 bg-white rounded-xl shadow-lg z-10 w-40 overflow-hidden border border-gray-100">
                {isMe ? (
                  <>
                    <div onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onEdit) onEdit(post); }} className="px-4 py-3 flex gap-3 items-center cursor-pointer text-sm text-gray-700 hover:bg-gray-50">
                      <Edit2 size={16} /> Edit
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onArchive) onArchive(post); }} className="px-4 py-3 flex gap-3 items-center cursor-pointer text-sm text-gray-700 hover:bg-gray-50">
                      <ArchiveIcon size={16} /> Arsip
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onDelete) onDelete(post); }} className="px-4 py-3 flex gap-3 items-center cursor-pointer text-sm text-red-500 hover:bg-gray-50">
                      <Trash2 size={16} /> Hapus
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">Tidak ada aksi</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <p className="m-0 mb-4 text-sm sm:text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words"><FormattedText text={post.content} /></p>

      {post.type === "poll" && post.pollData && (
         <div className="mb-5 flex flex-col gap-2.5">
           {post.pollData.options.map((opt: any) => {
              const totalVotes = post.pollData.options.reduce((acc: number, o: any) => acc + (o.votes?.length || 0), 0);
              const myVote = opt.votes?.includes(currentUser.uid);
              const percent = totalVotes > 0 ? Math.round(((opt.votes?.length || 0) / totalVotes) * 100) : 0;
              return (
                <div key={opt.id} onClick={(e) => { e.stopPropagation(); onVote(post.id, opt.id); }} className={`relative px-4 py-3 rounded-xl border cursor-pointer overflow-hidden flex justify-between items-center ${myVote ? 'border-blue-500' : 'border-gray-200'}`}>
                  <div className={`absolute left-0 top-0 bottom-0 z-0 transition-[width] duration-300 ease-in-out ${myVote ? 'bg-blue-500/10' : 'bg-gray-100'}`} style={{ width: `${percent}%` }} />
                  <span className={`relative z-10 text-sm sm:text-[15px] ${myVote ? 'font-bold' : 'font-medium'}`}>{opt.text}</span>
                  <span className={`relative z-10 text-[13px] sm:text-sm text-gray-500 ${myVote ? 'font-semibold' : 'font-normal'}`}>{percent}%</span>
                </div>
              )
           })}
           <div className="text-[12px] sm:text-[13px] text-gray-400 mt-1">{post.pollData.options.reduce((acc: number, o: any) => acc + (o.votes?.length || 0), 0)} votes</div>
         </div>
      )}
      
      <div className="flex items-center gap-6 sm:gap-8 mt-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onLike(post)} className={`flex items-center gap-2 bg-transparent border-none text-[13px] sm:text-sm font-semibold cursor-pointer transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
          <Heart size={18} fill={isLiked ? "#EF4444" : "none"} className="sm:w-5 sm:h-5" />
          {post.likes && post.likes.length > 0 && <span>{post.likes.length > 1000 ? (post.likes.length/1000).toFixed(1)+'k' : post.likes.length}</span>}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onReply(post); }} className="flex items-center gap-2 bg-transparent border-none text-[13px] sm:text-sm font-semibold cursor-pointer transition-colors hover:text-blue-500 text-gray-500">
          <MessageCircle size={18} className="sm:w-5 sm:h-5" />
          {post.repliesCount > 0 && <span>{post.repliesCount}</span>}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRepost(post); }} className={`flex items-center gap-2 bg-transparent border-none text-[13px] sm:text-sm font-semibold cursor-pointer transition-colors hover:text-emerald-500 ${isReposted ? 'text-emerald-500' : 'text-gray-500'}`}>
          <Repeat2 size={18} className="sm:w-5 sm:h-5" />
          {post.reposts && post.reposts.length > 0 && <span>{post.reposts.length}</span>}
        </button>
      </div>
    </div>
  );
}

export function SocHubView({ user, profile }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [view, setView] = useState<"feed"|"dms"|"post"|"activity"|"profile">("feed");
  const [profileTab, setProfileTab] = useState<"threads"|"replies"|"reposts">("threads");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(profile?.bio || "");
  const [chatUser, setChatUser] = useState<any>(null);
  
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<any[]>([]);

  // Post Creator State
  const [postType, setPostType] = useState<"text" | "poll">("text");
  const [pollOptions, setPollOptions] = useState<any[]>([{ id: '1', text: '' }, { id: '2', text: '' }]);

  // Chat/DM state
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgContent, setMsgContent] = useState("");
  
  // Activity state
  const [activities, setActivities] = useState<any[]>([]);
  
  // Suggested users
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [editingPost, setEditingPost] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingPost, setDeletingPost] = useState<any>(null);
  
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const unreadCount = activities.filter(a => !a.read).length;

  useEffect(() => {
    if (!viewedUserId) {
      setViewedProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", viewedUserId), (docSnap) => {
      if (docSnap.exists()) {
        setViewedProfile({uid: docSnap.id, ...docSnap.data()});
      } else {
        setViewedProfile(null);
      }
    });
    return () => unsub();
  }, [viewedUserId]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const q = query(collection(db, "users")); // Simplified search, no complex text search in firestore
    const unsub = onSnapshot(q, (snap) => {
      const allUsers = snap.docs.map(d => ({uid: d.id, ...(d.data() as any)}));
      const lowerQuery = searchQuery.toLowerCase();
      setSearchResults(allUsers.filter((u: any) => 
        (u.fullName && u.fullName.toLowerCase().includes(lowerQuery)) || 
        (u.nickname && u.nickname.toLowerCase().includes(lowerQuery)) ||
        (u.username && u.username.toLowerCase().includes(lowerQuery))
      ));
    }, (error) => { console.error("Snapshot error on", "q", error); });
    return () => unsub();
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;
    // Fetch some recent users (up to 5 for suggestions)
    const q = query(collection(db, "users"), limit(5));
    const unsub = onSnapshot(q, (snap) => {
      setSuggestedUsers(snap.docs.map(d => ({id: d.id, ...d.data()})).filter(u => u.id !== user.uid));
    }, (error) => { console.error("Snapshot error on", "q", error); });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "soc_posts"), where("replyTo", "==", null), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (error) => { console.error("Snapshot error on", "q", error); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (view !== "post" || !selectedPost) return;
    const q = query(collection(db, "soc_posts"), where("replyTo", "==", selectedPost.id), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setReplies(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (error) => { console.error("Snapshot error on", "q", error); });
    return () => unsub();
  }, [view, selectedPost]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "soc_chats"), where("participants", "array-contains", user.uid), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setChats(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (error) => { console.error("Snapshot error on", "q", error); });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (error) => { console.error("Snapshot error on", "q", error); });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!chatUser || !user) return;
    let chatId = user.uid < chatUser.uid ? `${user.uid}_${chatUser.uid}` : `${chatUser.uid}_${user.uid}`;
    const q = query(collection(db, "soc_messages"), where("chatId", "==", chatId), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (error) => { console.error("Snapshot error on", "q", error); });
    return () => unsub();
  }, [chatUser, user]);

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    
    let validOptions = [];
    if (postType === "poll") {
      validOptions = pollOptions.filter(o => o.text.trim().length > 0);
      if (validOptions.length < 2) {
        alert("Poll requires at least 2 options.");
        return;
      }
    }

    const postData: any = {
      authorId: user.uid,
      authorName: profile?.fullName || profile?.nickname || user.displayName || "User",
      authorUsername: profile?.username || "user_" + user.uid.substring(0, 5),
      authorAvatar: profile?.avatar || "",
      content: content.trim(),
      createdAt: serverTimestamp(),
      likes: [],
      reposts: [],
      repliesCount: 0,
      replyTo: null,
      type: postType
    };

    if (postType === "poll") {
      postData.pollData = {
        options: validOptions.map(o => ({ id: o.id, text: o.text, votes: [] }))
      };
    }

    try {
      await setDoc(doc(collection(db, "soc_posts")), postData);
      setContent("");
      setPostType("text");
      setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
    } catch (e) {
      console.error(e);
      alert("Gagal mengirim postingan.");
    }
  };

  const createNotification = async (targetUserId: string, type: string, postId: string, postContent: string) => {
    if (!user || user.uid === targetUserId) return;
    try {
      await setDoc(doc(collection(db, "notifications")), {
        userId: targetUserId,
        title: type === "like" ? "Seseorang menyukai postingan Anda" : type === "repost" ? "Seseorang membagikan postingan Anda" : type === "reply" ? "Seseorang membalas postingan Anda" : "Seseorang berpartisipasi di poll Anda",
        body: `${profile?.fullName || profile?.nickname || user.displayName || "Seseorang"} ${type === "like" ? "menyukai" : type === "repost" ? "membagikan ulang" : type === "reply" ? "membalas" : "mengisi polling"} postingan Anda: "${postContent.substring(0, 30)}..."`,
        type: "social",
        isArchived: false,
        createdAt: serverTimestamp(),
        link: "#/sochub"
      });
    } catch (e) {
      console.error("Failed to create notification", e);
    }
  };

  const handleLike = async (post: any) => {
    if (!user) return;
    const ref = doc(db, "soc_posts", post.id);
    const likes = post.likes || [];
    const hasLiked = likes.includes(user.uid);
    try {
      if (hasLiked) {
        await updateDoc(ref, { likes: likes.filter((id: string) => id !== user.uid) });
      } else {
        await updateDoc(ref, { likes: [...likes, user.uid] });
        createNotification(post.authorId, "like", post.id, post.content);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRepost = async (post: any) => {
    if (!user) return;
    const ref = doc(db, "soc_posts", post.id);
    const reposts = post.reposts || [];
    const hasReposted = reposts.includes(user.uid);
    try {
      if (hasReposted) {
        await updateDoc(ref, { reposts: reposts.filter((id: string) => id !== user.uid) });
      } else {
        await updateDoc(ref, { reposts: [...reposts, user.uid] });
        createNotification(post.authorId, "repost", post.id, post.content);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleVote = async (postId: string, optionId: string) => {
    if (!user) return;
    const postRef = doc(db, "soc_posts", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;
    
    const postData = postSnap.data();
    if (postData.type !== "poll" || !postData.pollData) return;
    
    let isNewVote = true;
    const newOptions = postData.pollData.options.map((opt: any) => {
      const votes = opt.votes || [];
      const hasVoted = votes.includes(user.uid);
      if (opt.id === optionId) {
        if (hasVoted) isNewVote = false;
        return { ...opt, votes: hasVoted ? votes.filter((id: string) => id !== user.uid) : [...votes, user.uid] };
      } else {
        if (hasVoted) isNewVote = false; // changed vote
        return { ...opt, votes: votes.filter((id: string) => id !== user.uid) };
      }
    });

    try {
      await updateDoc(postRef, {
        pollData: { ...postData.pollData, options: newOptions }
      });
      if (isNewVote) {
        createNotification(postData.authorId, "vote", postId, postData.content);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startDM = async (targetUserId: string, targetName: string = "Pengguna", targetAvatar: string = "") => {
    if (!user || user.uid === targetUserId) return;
    try {
      let chatId = user.uid < targetUserId ? `${user.uid}_${targetUserId}` : `${targetUserId}_${user.uid}`;
      const chatRef = doc(db, "soc_chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetUserId],
          participantData: {
            [user.uid]: { name: profile?.fullName || profile?.nickname || user.displayName || "User", avatar: profile?.avatar || "" },
            [targetUserId]: { name: targetName, avatar: targetAvatar }
          },
          updatedAt: serverTimestamp(),
          lastMessage: ""
        });
      }
      setChatUser({uid: targetUserId, name: targetName, avatar: targetAvatar});
      setView("dms");
    } catch (e) {
      console.error(e);
    }
  };

  const sendDM = async () => {
    if (!msgContent.trim() || !user || !chatUser) return;
    let chatId = user.uid < chatUser.uid ? `${user.uid}_${chatUser.uid}` : `${chatUser.uid}_${user.uid}`;
    try {
      await setDoc(doc(collection(db, "soc_messages")), {
        chatId,
        senderId: user.uid,
        content: msgContent.trim(),
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "soc_chats", chatId), {
        lastMessage: msgContent.trim(),
        updatedAt: serverTimestamp()
      });
      setMsgContent("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (post: any) => {
    setDeletingPost(post);
  };

  const confirmDelete = async () => {
    if (!deletingPost) return;
    try {
      await deleteDoc(doc(db, "soc_posts", deletingPost.id));
      setDeletingPost(null);
      if (selectedPost?.id === deletingPost.id) {
        setView("feed");
        setSelectedPost(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (post: any) => {
    try {
      await updateDoc(doc(db, "soc_posts", post.id), { isArchived: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleFollow = async (targetId: string) => {
    if (!user || user.uid === targetId) return;
    try {
      const targetDoc = await getDoc(doc(db, "users", targetId));
      if (targetDoc.exists()) {
        const targetFollowers = targetDoc.data()?.followers || [];
        await updateDoc(doc(db, "users", targetId), {
          followers: [...new Set([...targetFollowers, user.uid])]
        });
      }
      const myDoc = await getDoc(doc(db, "users", user.uid));
      if (myDoc.exists()) {
        const myFollowing = myDoc.data()?.following || [];
        await updateDoc(doc(db, "users", user.uid), {
          following: [...new Set([...myFollowing, targetId])]
        });
      }
      createNotification(targetId, "follow", "", "mulai mengikuti Anda");
    } catch(e) { console.error(e) }
  };

  const handleUnfollow = async (targetId: string) => {
    if (!user || user.uid === targetId) return;
    try {
      const targetDoc = await getDoc(doc(db, "users", targetId));
      if (targetDoc.exists()) {
        const targetFollowers = targetDoc.data()?.followers || [];
        await updateDoc(doc(db, "users", targetId), {
          followers: targetFollowers.filter((id: string) => id !== user.uid)
        });
      }
      const myDoc = await getDoc(doc(db, "users", user.uid));
      if (myDoc.exists()) {
        const myFollowing = myDoc.data()?.following || [];
        await updateDoc(doc(db, "users", user.uid), {
          following: myFollowing.filter((id: string) => id !== targetId)
        });
      }
    } catch(e) { console.error(e) }
  };

  const onProfileClick = (uid: string) => {
    setViewedUserId(uid);
    setView("profile");
  };

  const handleSaveBio = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { bio: bioInput.trim() });
      setIsEditingBio(false);
    } catch (e) {
      console.error(e);
    }
  };

  const confirmEdit = async () => {
    if (!editingPost || !editContent.trim()) return;
    try {
      await updateDoc(doc(db, "soc_posts", editingPost.id), { content: editContent.trim() });
      setEditingPost(null);
    } catch (e) {
      console.error(e);
    }
  };

  const openThread = (p: any) => {
    setSelectedPost(p);
    setView("post");
  };

  const handleReplyClick = (p: any) => {
    setSelectedPost(p);
    setView("post");
    setReplyContent(`@${p.authorUsername} `);
    setTimeout(() => {
      document.getElementById("reply-input")?.focus();
    }, 100);
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !user || !selectedPost) return;
    const postData = {
      authorId: user.uid,
      authorName: profile?.fullName || profile?.nickname || user.displayName || "User",
      authorUsername: profile?.username || "user_" + user.uid.substring(0, 5),
      authorAvatar: profile?.avatar || "",
      content: replyContent.trim(),
      createdAt: serverTimestamp(),
      likes: [],
      reposts: [],
      repliesCount: 0,
      replyTo: selectedPost.id,
      type: "text"
    };
    try {
      await setDoc(doc(collection(db, "soc_posts")), postData);
      const postRef = doc(db, "soc_posts", selectedPost.id);
      await updateDoc(postRef, {
        repliesCount: (selectedPost.repliesCount || 0) + 1
      });
      createNotification(selectedPost.authorId, "reply", selectedPost.id, selectedPost.content);
      setReplyContent("");
    } catch (e) {
      console.error(e);
    }
  };

  // UI layout imitating CozMeet ref image

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto h-screen lg:overflow-hidden overflow-y-auto flex flex-col bg-gray-50 p-4 sm:p-6 lg:p-8">
      
      {/* Top Navbar Header inside SocHub */}
      <div className="flex flex-wrap items-center justify-between mb-6 lg:mb-8 shrink-0 bg-white p-3 sm:px-6 rounded-3xl shadow-sm gap-4">
        <div className="flex items-center gap-4 lg:gap-8 lg:w-60 min-w-0">
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight m-0">
            SocHub
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-center gap-2 lg:gap-4 overflow-x-auto no-scrollbar w-full sm:w-auto flex-1 order-last sm:order-none">
           <NavButton icon={Bell} active={view === "activity"} badge={unreadCount} onClick={() => setView("activity")} />
           <NavButton icon={Home} label="Home" active={view === "feed"} onClick={() => { setView("feed"); setChatUser(null); }} />
           <NavButton icon={MessageCircle} active={view === "dms"} onClick={() => setView("dms")} />
        </div>

        <div className="flex justify-end hidden md:flex items-center lg:w-60 shrink-0 relative">
           <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center w-full min-w-0">
             <input type="text" placeholder="Search user..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full min-w-0" />
           </div>
           {searchQuery && (
             <div className="absolute top-12 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 p-2 max-h-60 overflow-y-auto z-50">
               {searchResults.length === 0 ? (
                 <div className="p-3 text-sm text-center text-gray-500">Tidak temukan pengguna.</div>
               ) : (
                 searchResults.map(s => (
                   <div key={s.uid} onClick={() => { setSearchQuery(""); onProfileClick(s.uid); }} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                     <img src={s.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${s.uid}&backgroundColor=ffffff`} className="w-8 h-8 rounded-full object-cover" />
                     <div className="min-w-0 flex-1">
                       <div className="font-bold text-sm text-gray-900 truncate">{s.fullName || s.nickname || "User"}</div>
                       <div className="text-xs text-gray-500 truncate">@{s.username || "user_" + s.uid.substring(0,5)}</div>
                     </div>
                   </div>
                 ))
               )}
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 lg:overflow-hidden">
        
        {/* Left Column */}
        <div className={`flex flex-col w-full lg:w-[240px] shrink-0 gap-6 lg:overflow-y-auto lg:pb-[60px] hide-scrollbar ${view === "profile" ? 'hidden lg:hidden' : 'hidden lg:flex'}`}>
          {/* Profile Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div style={{ height: 60, background: "linear-gradient(135deg, #E2E8F0 0%, #F1F5F9 100%)" }} />
            <div style={{ padding: "0 20px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center", marginTop: -30 }}>
               <img src={profile?.avatar || getAvatar(profile, user?.uid)} style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid white", objectFit: "cover", marginBottom: 12 }} />
               <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>{profile?.fullName || user?.displayName || "User"}</div>
               <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>@{profile?.username || "user_" + user?.uid?.substring(0,5)}</div>
               <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>{posts.filter((p:any) => p.authorId === user?.uid).length}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>Post</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>2k</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>Followers</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>590</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>Following</div>
                  </div>
               </div>
               <button onClick={() => setView("profile")} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "var(--theme-primary)", color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>My Profile</button>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="flex-1 flex flex-col gap-6 lg:overflow-y-auto lg:pb-[60px] min-w-0 hide-scrollbar">
           
           {/* Post Creator */}
           {view === "feed" && (
             <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm">
               <div className="flex gap-4 mb-4">
                 <img src={profile?.avatar || getAvatar(profile, user?.uid)} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0" />
                 <div className="flex-1 bg-gray-50 rounded-3xl px-4 py-3 flex items-center">
                   <input type="text" placeholder="Share something..." value={content} onChange={e => setContent(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-gray-900" />
                 </div>
               </div>
               
               {/* Controls */}
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div className="flex gap-4 sm:gap-6 pl-0 sm:pl-[60px]">
                   <button onClick={() => setPostType("text")} className={`flex items-center gap-2 text-sm font-bold transition-colors ${postType === "text" ? "text-gray-900" : "text-gray-500"}`}><MessageSquare size={18} /> Text</button>
                   <button onClick={() => setPostType("poll")} className={`flex items-center gap-2 text-sm font-bold transition-colors ${postType === "poll" ? "text-gray-900" : "text-gray-500"}`}><BarChart2 size={18} /> Poll</button>
                 </div>
                 
                 <div className="flex items-center gap-4 self-end sm:self-auto">
                   <button onClick={handlePost} disabled={!content.trim() && postType === "text"} className="px-6 py-2.5 rounded-full font-bold text-sm transition-colors" style={{ background: (content.trim() || postType === "poll") ? "var(--theme-primary)" : "#E5E7EB", color: (content.trim() || postType === "poll") ? "white" : "#9CA3AF" }}>Post</button>
                 </div>
               </div>
               
               {/* Poll Input */}
               {postType === "poll" && (
                 <div style={{ marginTop: 24, paddingLeft: 60, display: "flex", flexDirection: "column", gap: 12 }}>
                   {pollOptions.map((opt, i) => (
                      <input key={i} placeholder={`Option ${i+1}`} value={opt.text} onChange={(e) => { const newOpts = [...pollOptions]; newOpts[i].text = e.target.value; setPollOptions(newOpts); }} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", background: "#F9FAFB", width: "100%", maxWidth: 400 }} />
                   ))}
                   {pollOptions.length < 4 && <button onClick={() => setPollOptions([...pollOptions, {id: Date.now().toString(), text: ''}])} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--theme-primary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Add Option</button>}
                 </div>
               )}
             </div>
           )}

           {/* View Router */}
           {view === "feed" && (
             <div style={{ display: "flex", flexDirection: "column" }}>
               <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
                 Sort by : <b style={{ color: "#111827", marginLeft: 6 }}>Recent <ChevronDown size={14} style={{ display: "inline", verticalAlign: "middle" }}/></b>
               </div>
               {posts.filter(p => !p.isArchived).map(p => (
                 <PostItem key={p.id} post={p} currentUser={user} onReply={() => handleReplyClick(p)} onLike={handleLike} onRepost={handleRepost} onShare={() => {}} onProfile={() => {}} onVote={handleVote} onOpenPost={openThread} onDelete={handleDelete} onEdit={handleEdit} onArchive={handleArchive} />
               ))}
             </div>
           )}
           {view === "profile" && (() => {
             const isMe = !viewedUserId || viewedUserId === user?.uid;
             const pData = isMe ? profile : viewedProfile;
             const pUid = isMe ? user?.uid : viewedUserId;
             const isFollowing = (pData?.followers || []).includes(user?.uid);
             
             if (!isMe && !pData) return <div className="text-center p-10 text-gray-500">Memuat profil...</div>;

             return (
             <div className="flex flex-col gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm overflow-hidden relative">
                   <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-100 to-indigo-100 z-0"></div>
                   
                   <div className="relative z-10 mt-12 flex justify-between items-start">
                     <div>
                       <h2 className="text-2xl font-black text-gray-900 m-0">{pData?.fullName || pData?.nickname || "User"}</h2>
                       <div className="text-gray-500 mb-4">@{pData?.username || "user_" + (pUid || "").substring(0,5)}</div>
                     </div>
                     <img src={pData?.avatar || getAvatar(pData, pUid)} className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white" />
                   </div>

                   <div className="relative z-10 mb-6">
                     {isMe && isEditingBio ? (
                       <div className="flex flex-col gap-3">
                         <textarea 
                           className="w-full bg-gray-50 rounded-xl p-3 border-none outline-none resize-none text-sm text-gray-800 font-medium" 
                           rows={3}
                           value={bioInput}
                           onChange={(e) => setBioInput(e.target.value)}
                           placeholder="Tulis bio tentang kamu..."
                         />
                         <div className="flex gap-2 justify-end">
                           <button onClick={() => setIsEditingBio(false)} className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-bold">Batal</button>
                           <button onClick={handleSaveBio} className="px-4 py-1.5 rounded-full bg-[var(--theme-primary)] text-white text-sm font-bold">Simpan</button>
                         </div>
                       </div>
                     ) : (
                       <div>
                         <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed m-0 mb-4">
                           {pData?.bio || "Belum ada bio."}
                         </p>
                         {isMe ? (
                           <button onClick={() => setIsEditingBio(true)} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm font-bold transition-colors w-full sm:w-auto">
                             Edit Bio
                           </button>
                         ) : (
                           <div className="flex gap-2">
                             <button onClick={() => isFollowing ? handleUnfollow(pUid) : handleFollow(pUid)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors w-full sm:w-auto ${isFollowing ? 'bg-gray-100 text-gray-800' : 'bg-[var(--theme-primary)] text-white hover:bg-blue-600'}`}>
                                {isFollowing ? 'Mengikuti' : 'Ikuti'}
                             </button>
                             <button onClick={() => startDM(pUid, pData?.fullName || pData?.nickname || "User", pData?.avatar)} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm font-bold transition-colors w-full sm:w-auto">
                                Pesan
                             </button>
                           </div>
                         )}
                       </div>
                     )}
                   </div>

                   <div className="relative z-10 flex gap-6 text-sm">
                      <div className="flex items-center gap-1.5 border-b-2 border-transparent">
                        <span className="font-black text-gray-900">{posts.filter((p:any) => p.authorId === pUid).length}</span>
                        <span className="text-gray-500">Post</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-gray-900">{pData?.followers?.length || 0}</span>
                        <span className="text-gray-500">Followers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-gray-900">{pData?.following?.length || 0}</span>
                        <span className="text-gray-500">Following</span>
                      </div>
                   </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 border-b border-gray-200 px-4">
                  {(["threads", "replies", "reposts"] as const).map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setProfileTab(tab)} 
                      className={`flex-1 py-3 text-center text-sm font-bold transition-colors relative ${profileTab === tab ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      <h3 className="m-0 capitalize">{tab}</h3>
                      {profileTab === tab && <motion.div layoutId="profileTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />}
                    </button>
                  ))}
                </div>

                {/* Content List */}
                <div className="flex flex-col gap-4">
                  {posts
                    .filter((p:any) => {
                      if (p.isArchived) return false;
                      if (profileTab === "threads") return p.authorId === pUid; // Since posts are already replyTo=null
                      if (profileTab === "replies") return false; // Not fetched in main query natively, we can fallback to nothing or if we fetched everything... wait, replies might be slow.
                      if (profileTab === "reposts") return p.reposts?.includes(pUid);
                      return false;
                    })
                    .map(p => (
                      <PostItem key={p.id} post={p} currentUser={user} onReply={() => handleReplyClick(p)} onLike={handleLike} onRepost={handleRepost} onShare={() => {}} onProfile={() => onProfileClick(p.authorId)} onVote={handleVote} onOpenPost={openThread} onDelete={handleDelete} onEdit={handleEdit} onArchive={handleArchive} />
                    ))}
                  
                  {posts.filter((p:any) => p.isArchived === false && (profileTab === "threads" ? p.authorId === pUid : profileTab === "reposts" ? p.reposts?.includes(pUid) : false)).length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                      {profileTab === "threads" ? "Belum ada thread yang dibuat." : profileTab === "replies" ? "Fitur replies sedang disempurnakan." : "Belum ada postingan yang di-repost."}
                    </div>
                  )}
                </div>
             </div>
           )})()}
           
           {view === "post" && selectedPost && (
             <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, cursor: "pointer" }} onClick={() => setView("feed")}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}><ArrowLeft size={20} color="#111827" /></div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>Thread</h2>
                </div>
                
                <PostItem post={selectedPost} currentUser={user} onReply={() => handleReplyClick(selectedPost)} onLike={handleLike} onRepost={handleRepost} onShare={() => {}} onProfile={() => {}} onVote={handleVote} onDelete={handleDelete} onEdit={handleEdit} onArchive={handleArchive} />
                
                <div style={{ display: "flex", gap: 16, marginBottom: 24, background: "white", padding: 24, borderRadius: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <img src={profile?.avatar || getAvatar(profile, user?.uid)} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ flex: 1, background: "#F9FAFB", borderRadius: 24, padding: "12px 20px" }}>
                    <input id="reply-input" value={replyContent} onChange={e => setReplyContent(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReply()} placeholder="Write your comment..." style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14 }} />
                  </div>
                </div>
                
                {replies.filter(r => !r.isArchived).map(r => (
                  <PostItem key={r.id} post={r} currentUser={user} onReply={() => handleReplyClick(r)} onLike={handleLike} onRepost={handleRepost} onShare={() => {}} onProfile={() => {}} onVote={handleVote} onOpenPost={openThread} onDelete={handleDelete} onEdit={handleEdit} onArchive={handleArchive} />
                ))}
             </div>
           )}
           
           {view === "dms" && (
             <div style={{ flex: 1, display: "flex", background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                {/* Chat List */}
                <div style={{ width: 300, borderRight: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", background: "#F9FAFB" }}>
                   <div style={{ padding: "24px", fontWeight: 800, fontSize: 18, color: "#111827" }}>Messages</div>
                   <div style={{ flex: 1, overflowY: "auto" }}>
                     {chats.length === 0 && (
                       <div className="p-6 text-center text-gray-400 text-sm">
                         Belum ada pesan. Kunjungi profil pengguna untuk mulai mengirim pesan.
                       </div>
                     )}
                     {chats.map(chat => {
                       const otherId = chat.participants.find((p: string) => p !== user.uid);
                       const otherData = chat.participantData?.[otherId] || { name: "User", avatar: "" };
                       return (
                         <div key={chat.id} onClick={() => setChatUser({uid: otherId, ...otherData})} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", background: chatUser?.uid === otherId ? "white" : "transparent", display: "flex", gap: 12, alignItems: "center" }} className="hover:bg-white transition-colors">
                            <img src={otherData.avatar || getAvatar(null, otherId)} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{otherData.name}</div>
                              <div style={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chat.lastMessage || "Mulai chat..."}</div>
                            </div>
                         </div>
                       )
                     })}
                   </div>
                </div>
                {/* Chat Window */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {chatUser ? (
                    <>
                      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                        <img src={chatUser.avatar || getAvatar(null, chatUser.uid)} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>{chatUser.name || "Pengguna"}</div>
                          <div style={{ fontSize: 13, color: "#6B7280" }}>Active now</div>
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                        {messages.map(m => {
                          const isMe = m.senderId === user.uid;
                          return (
                            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                              <div style={{ background: isMe ? "var(--theme-primary)" : "#F3F4F6", color: isMe ? "white" : "#111827", padding: "12px 16px", borderRadius: 20, borderBottomRightRadius: isMe ? 4 : 20, borderBottomLeftRadius: isMe ? 20 : 4, fontSize: 15, maxWidth: "70%" }}>{m.content}</div>
                              <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6, padding: "0 4px" }}>{m.createdAt?.toMillis ? formatDistanceToNow(m.createdAt.toMillis(), { addSuffix: true, locale: dfnsId }) : 'Baru saja'}</span>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                      <div style={{ padding: 24, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#F9FAFB", padding: "8px 16px", borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)" }}>
                          <input type="text" value={msgContent} onChange={e => setMsgContent(e.target.value)} onKeyDown={e => e.key === "Enter" && sendDM()} placeholder="Write your message..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15 }} />
                          <button onClick={sendDM} disabled={!msgContent.trim()} style={{ background: msgContent.trim() ? "var(--theme-primary)" : "transparent", color: msgContent.trim() ? "white" : "#9CA3AF", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: msgContent.trim() ? "pointer" : "default" }}>
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                       <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                       <div style={{ fontWeight: 700, fontSize: 16, color: "#4B5563" }}>Your Messages</div>
                       <div style={{ fontSize: 14 }}>Select a conversation to start chatting</div>
                    </div>
                  )}
                </div>
             </div>
           )}
           
           {view === "activity" && (
             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 900, color: "#111827" }}>Notifications</h2>
               <div style={{ background: "white", borderRadius: 24, padding: "16px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                 {activities.map(a => (
                   <div key={a.id} onClick={async () => { if (!a.read) await updateDoc(doc(db, "notifications", a.id), { read: true }); }} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.04)", display: "flex", gap: 16, alignItems: "flex-start", background: a.read ? "transparent" : "#F3F4F6", cursor: "pointer", transition: "background 0.2s" }} className="hover:bg-gray-50">
                     <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--theme-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                       <Bell size={24} />
                     </div>
                     <div>
                       <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 4 }}>{a.title}</div>
                       <div style={{ fontSize: 15, color: "#4B5563", marginBottom: 8, lineHeight: 1.4 }}>{a.body}</div>
                       <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>
                         {a.createdAt?.toMillis ? formatDistanceToNow(a.createdAt.toMillis(), { addSuffix: true, locale: dfnsId }) : 'Baru saja'}
                       </div>
                     </div>
                   </div>
                 ))}
                 {activities.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No recent activity.</div>}
               </div>
             </div>
           )}
        </div>

        {/* Right Column */}
        {view !== "dms" && view !== "activity" && (
          <div className="flex flex-col w-full lg:w-[300px] shrink-0 gap-6 lg:overflow-y-auto lg:pb-[60px] hide-scrollbar">
             {/* Activity */}
             <div className="bg-white rounded-3xl p-6 shadow-sm">
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
                 <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>Activity</div>
                 <div style={{ fontSize: 13, color: "#9CA3AF", cursor: "pointer", fontWeight: 600 }}>See all</div>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                 {activities.slice(0, 4).map(a => (
                   <div key={a.id} style={{ display: "flex", gap: 16, alignItems: "center", cursor: "pointer" }} onClick={() => setView("activity")}>
                     <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-primary)" }}><Bell size={20}/></div>
                     <div style={{ flex: 1, fontSize: 14, lineHeight: 1.4, color: "#374151" }}>
                       <b style={{ color: "#111827" }}>{a.title.split(" ")[0]}</b> {a.title.split(" ").slice(1).join(" ")}
                       <div style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>{a.createdAt?.toMillis ? formatDistanceToNow(a.createdAt.toMillis(), { addSuffix: true, locale: dfnsId }) : 'Baru saja'}</div>
                     </div>
                   </div>
                 ))}
                 {activities.length === 0 && <div style={{ fontSize: 14, color: "#9CA3AF" }}>Belum ada aktivitas.</div>}
               </div>
             </div>
             
             {/* Suggested For you */}
             <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
                 <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>Suggested For you</div>
                 <div style={{ fontSize: 13, color: "#9CA3AF", cursor: "pointer", fontWeight: 600 }}>See all</div>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                     {suggestedUsers.length > 0 ? suggestedUsers.map((s) => (
                     <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                         <img src={s.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${s.id}&backgroundColor=ffffff`} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid #F3F4F6", objectFit: "cover", flexShrink: 0 }} />
                         <div style={{ minWidth: 0 }}>
                           <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.fullName || s.nickname || "User"}</div>
                           <div style={{ fontSize: 13, color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{s.username || "user_" + s.id.substring(0,5)}</div>
                         </div>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); onProfileClick(s.id); }} style={{ background: "none", border: "none", color: "var(--theme-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink:0 }}>View</button>
                     </div>
                   )) : <div style={{ fontSize: 13, color: "#9CA3AF" }}>Tidak ada saran.</div>}
               </div>
             </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {editingPost && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{scale: 0.95}} animate={{scale: 1}} exit={{scale: 0.95}} className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Postingan</h3>
              <textarea 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                className="w-full bg-gray-50 border-none outline-none rounded-xl p-4 min-h-[120px] text-gray-900 mb-4 resize-none"
                placeholder="Tulis sesuatu..."
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingPost(null)} className="px-6 py-2 rounded-full font-bold text-sm bg-gray-100 text-gray-700">Batal</button>
                <button onClick={confirmEdit} disabled={!editContent.trim()} className="px-6 py-2 rounded-full font-bold text-sm bg-[var(--theme-primary)] text-white disabled:opacity-50">Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {deletingPost && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{scale: 0.95}} animate={{scale: 1}} exit={{scale: 0.95}} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 mx-auto flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Postingan</h3>
              <p className="text-gray-500 mb-6 text-sm">Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.</p>
              
              <div className="flex flex-col gap-3 w-full">
                <button onClick={confirmDelete} className="w-full px-6 py-3 rounded-full font-bold text-sm bg-red-500 text-white">Ya, Hapus</button>
                <button onClick={() => setDeletingPost(null)} className="w-full px-6 py-3 rounded-full font-bold text-sm bg-gray-100 text-gray-700">Batal</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hide scrollbar styles purely local if needed, tailwind scrollbar-hide might not be available */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
