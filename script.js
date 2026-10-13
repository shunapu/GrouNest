const communities = [
  {
    id: "habits",
    name: "朝活・習慣づくり",
    emoji: "🌿",
    theme: "habit-avatar",
    members: 18,
    description: "無理のない小さな習慣を、仲間と一緒に続けてみませんか。",
  },
  {
    id: "design",
    name: "ゆるく学ぶデザイン",
    emoji: "🎨",
    theme: "design-avatar",
    members: 24,
    description: "初めてでも大丈夫。気づきや作品を持ち寄って学び合う場所。",
  },
  {
    id: "reading",
    name: "本から学び合う読書会",
    emoji: "📚",
    theme: "reading-avatar",
    members: 16,
    description: "心に残った一節や学びをシェアして、ゆっくり深めよう。",
  },
  {
    id: "challenge",
    name: "小さな挑戦ラボ",
    emoji: "✨",
    theme: "challenge-avatar",
    members: 12,
    description: "やってみたいことを宣言して、応援し合いながら一歩ずつ。",
  },
];

const posts = [
  {
    id: 1,
    author: "Mika Sato",
    initial: "M",
    avatarClass: "avatar-coral",
    community: "朝活・習慣づくり",
    time: "2時間前",
    content: "今週は朝10分の読書を続けられました🌱 小さくてもできたことを報告できる場所があると、次の日も机に向かえます。みんなの小さな一歩も聞かせてください。",
    image: "🪴",
    imageClass: "",
    likes: 24,
    comments: 8,
    liked: false,
  },
  {
    id: 2,
    author: "Ryo Nakamura",
    initial: "R",
    avatarClass: "avatar-blue",
    community: "ゆるく学ぶデザイン",
    time: "5時間前",
    content: "はじめて作ったバナーをみんなに見てもらいました🎨 自分では気づかなかった良いところも教えてもらえて、次も作ってみようと思えます。",
    image: "🎨",
    imageClass: "design-scene",
    likes: 18,
    comments: 4,
    liked: false,
  },
  {
    id: 3,
    author: "Yuna",
    initial: "Y",
    avatarClass: "avatar-yellow",
    community: "本から学び合う読書会",
    time: "昨日",
    content: "今月の目標だった一冊を読み終えました📖 気になったところを話していたら、同じ本でも受け取り方が違っておもしろい。次はみんなのおすすめも読んでみます。",
    image: "📚",
    imageClass: "books-scene",
    likes: 31,
    comments: 12,
    liked: false,
  },
];

const joinedCommunityIds = new Set(["habits", "design", "reading"]);
const postList = document.querySelector("#post-list");
const communityCards = document.querySelector("#community-cards");
const joinedCommunities = document.querySelector("#joined-communities");
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const composerDialog = document.querySelector("#composer-dialog");
const composerForm = document.querySelector("#composer-form");
const postText = document.querySelector("#post-text");
const characterCount = document.querySelector("#character-count");
const toast = document.querySelector("#toast");
const profileImageInput = document.querySelector("#profile-image-input");
const profileImageStorageKey = "grouNest.profileImage";
let activeFilter = "おすすめ";
let toastTimeout;
let profileImageData = "";

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function applyProfileImage(avatar) {
  if (!profileImageData) return;
  avatar.textContent = "";
  avatar.style.backgroundImage = `url("${profileImageData}")`;
  avatar.style.backgroundPosition = "center";
  avatar.style.backgroundSize = "cover";
}

function saveProfileImage(imageData) {
  profileImageData = imageData;
  document.querySelectorAll(".avatar-you").forEach(applyProfileImage);

  try {
    window.localStorage.setItem(profileImageStorageKey, imageData);
    showToast("プロフィール画像を変更しました");
  } catch {
    showToast("画像は変更しましたが、このブラウザーには保存できませんでした");
  }
}

function resizeProfileImage(file) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      try {
        const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("画像を処理できませんでした"));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("画像を圧縮できませんでした"));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("画像を読み込めませんでした"));
          reader.readAsDataURL(blob);
        }, "image/jpeg", 0.82);
      } catch {
        reject(new Error("画像を処理できませんでした"));
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("この画像ファイルを開けませんでした"));
    };
    image.src = imageUrl;
  });
}

function renderCommunities() {
  communityCards.replaceChildren();
  joinedCommunities.replaceChildren();

  communities.forEach((community) => {
    const card = makeElement("article", "community-card");
    const top = makeElement("div", "community-card-top");
    const avatar = makeElement("span", `community-avatar ${community.theme}`, community.emoji);
    avatar.setAttribute("aria-hidden", "true");
    const copy = makeElement("div");
    copy.append(
      makeElement("h3", "", community.name),
      makeElement("p", "member-count", `${community.members}人が参加中`),
    );
    top.append(avatar, copy);
    card.append(top, makeElement("p", "community-description", community.description));

    const joined = joinedCommunityIds.has(community.id);
    const joinButton = makeElement("button", `join-button${joined ? " is-joined" : ""}`, joined ? "参加中 ✓" : "参加する ＋");
    joinButton.type = "button";
    joinButton.setAttribute("aria-pressed", String(joined));
    joinButton.addEventListener("click", () => {
      if (joinedCommunityIds.has(community.id)) {
        joinedCommunityIds.delete(community.id);
        showToast(`${community.name}から退出しました`);
      } else {
        joinedCommunityIds.add(community.id);
        showToast(`${community.name}に参加しました`);
      }
      renderCommunities();
    });
    card.append(joinButton);
    communityCards.append(card);

    if (joinedCommunityIds.has(community.id)) {
      const link = makeElement("a", "joined-link");
      link.href = "#feed";
      const dot = makeElement("span", `community-dot ${community.theme}`, community.emoji);
      dot.setAttribute("aria-hidden", "true");
      link.append(dot, makeElement("span", "", community.name));
      link.addEventListener("click", () => {
        document.querySelector('[data-view="feed"]')?.classList.add("is-active");
      });
      joinedCommunities.append(link);
    }
  });
}

function renderPosts() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const visiblePosts = posts.filter((post) => {
    const searchableText = `${post.author} ${post.community} ${post.content}`.toLocaleLowerCase();
    return searchableText.includes(query);
  });

  if (activeFilter === "新着") visiblePosts.reverse();
  postList.replaceChildren();
  emptyState.hidden = visiblePosts.length > 0;

  visiblePosts.forEach((post) => {
    const card = makeElement("article", "post-card");
    const topLine = makeElement("div", "post-topline");
    const author = makeElement("div", "post-author");
    const avatar = makeElement("span", `avatar ${post.avatarClass}`, post.initial);
    avatar.setAttribute("aria-hidden", "true");
    if (post.avatarClass === "avatar-you") applyProfileImage(avatar);
    const meta = makeElement("div", "post-meta");
    meta.append(
      makeElement("strong", "", post.author),
      makeElement("span", "", `${post.community} · ${post.time}`),
    );
    author.append(avatar, meta);
    const menu = makeElement("button", "icon-button small post-menu", "···");
    menu.type = "button";
    menu.setAttribute("aria-label", "投稿メニュー");
    menu.addEventListener("click", () => showToast("投稿メニューは準備中です"));
    topLine.append(author, menu);

    const content = makeElement("p", "post-content", post.content);
    const image = makeElement("div", `post-image ${post.imageClass}`, post.image);
    image.setAttribute("aria-hidden", "true");

    const actions = makeElement("div", "post-actions");
    const likeButton = makeElement("button", `post-action${post.liked ? " is-liked" : ""}`);
    likeButton.type = "button";
    likeButton.setAttribute("aria-pressed", String(post.liked));
    likeButton.append(makeElement("span", "", post.liked ? "♥" : "♡"), document.createTextNode(` ${post.likes}`));
    likeButton.addEventListener("click", () => {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      renderPosts();
    });
    const commentButton = makeElement("button", "post-action");
    commentButton.type = "button";
    commentButton.append(makeElement("span", "", "▱"), document.createTextNode(` ${post.comments} コメント`));
    commentButton.addEventListener("click", () => showToast("コメント機能は準備中です"));
    actions.append(likeButton, commentButton);

    card.append(topLine, content);
    if (post.image) card.append(image);
    card.append(actions);
    postList.append(card);
  });
}

function addPost(content) {
  posts.unshift({
    id: Date.now(),
    author: "Yuki Tanaka",
    initial: "Y",
    avatarClass: "avatar-you",
    community: "朝活・習慣づくり",
    time: "たった今",
    content,
    image: "",
    imageClass: "",
    likes: 0,
    comments: 0,
    liked: false,
  });
  renderPosts();
  composerForm.reset();
  characterCount.textContent = "0 / 500";
  composerDialog.close();
  showToast("投稿をシェアしました！");
}

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());

document.querySelectorAll("[data-view]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const view = link.dataset.view;
    if (view === "feed") {
      event.preventDefault();
      document.querySelector("#feed").scrollIntoView({ behavior: "smooth" });
    } else if (view === "discover") {
      event.preventDefault();
      document.querySelector("#communities-title").scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (view !== "events") {
      event.preventDefault();
      showToast(`${link.textContent.trim()}は準備中です`);
    }

    if (view === "feed" || view === "discover") {
      document.querySelectorAll(".nav-link[data-view]").forEach((item) => item.classList.remove("is-active"));
      document.querySelector(`.nav-link[data-view="${view}"]`)?.classList.add("is-active");
    }
  });
});

document.querySelector("#open-composer").addEventListener("click", () => {
  composerDialog.showModal();
  postText.focus();
});

document.querySelectorAll(".profile-switcher, .topbar-avatar").forEach((button) => {
  button.addEventListener("click", () => {
    profileImageInput.value = "";
    profileImageInput.click();
  });
});

profileImageInput.addEventListener("change", async () => {
  const [file] = profileImageInput.files;
  if (!file) return;
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    showToast("JPEG、PNG、WebPなどの画像ファイルを選択してください");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast("画像は10MB以下のファイルを選択してください");
    return;
  }

  try {
    const imageData = await resizeProfileImage(file);
    saveProfileImage(imageData);
  } catch (error) {
    showToast(error.message);
  }
});

document.querySelector("#close-composer").addEventListener("click", () => composerDialog.close());

composerDialog.addEventListener("click", (event) => {
  if (event.target === composerDialog) composerDialog.close();
});

postText.addEventListener("input", () => {
  characterCount.textContent = `${postText.value.length} / 500`;
});

composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const content = postText.value.trim();
  if (content) addPost(content);
});

searchInput.addEventListener("input", renderPosts);

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("is-selected", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    renderPosts();
  });
});

document.querySelectorAll(".follow-button").forEach((button) => {
  button.addEventListener("click", () => {
    const following = button.classList.toggle("is-following");
    button.textContent = following ? "✓" : "＋";
    button.setAttribute("aria-pressed", String(following));
    showToast(following ? "メンバーをフォローしました" : "フォローを解除しました");
  });
});

document.querySelector(".notification-button").addEventListener("click", () => {
  showToast("新しい通知はありません");
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

try {
  profileImageData = window.localStorage.getItem(profileImageStorageKey) || "";
} catch {
  showToast("保存済みのプロフィール画像を読み込めませんでした");
}
document.querySelectorAll(".avatar-you").forEach(applyProfileImage);

renderCommunities();
renderPosts();
