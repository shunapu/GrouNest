const communities = [
  {
    id: "garden",
    name: "週末ガーデニング部",
    emoji: "🌿",
    theme: "garden-avatar",
    members: 128,
    description: "ベランダ菜園からお庭づくりまで、植物のある暮らしを楽しもう。",
  },
  {
    id: "camera",
    name: "写真とカメラ好き",
    emoji: "📷",
    theme: "camera-avatar",
    members: 246,
    description: "何気ない日常も旅先の景色も。写真好きが集まる場所です。",
  },
  {
    id: "books",
    name: "本と読書",
    emoji: "📚",
    theme: "book-avatar",
    members: 89,
    description: "最近読んだ本や心に残った一冊について語りませんか？",
  },
  {
    id: "coffee",
    name: "カフェ時間",
    emoji: "☕",
    theme: "coffee-avatar",
    members: 174,
    description: "お気に入りのカフェや、おうちコーヒーをシェアしよう。",
  },
];

const posts = [
  {
    id: 1,
    author: "Mika Sato",
    initial: "M",
    avatarClass: "avatar-coral",
    community: "週末ガーデニング部",
    time: "2時間前",
    content: "ベランダのバジルがこんなに大きくなりました🌱 朝に葉っぱを摘んでパスタにするのが最近の楽しみ。みなさんは何を育てていますか？",
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
    community: "カフェ時間",
    time: "5時間前",
    content: "下北沢で見つけた小さなコーヒースタンド。深煎りのラテと焼きたてのスコーンが最高でした☕ ほっとひと息つきたい日におすすめです。",
    image: "☕",
    imageClass: "coffee-scene",
    likes: 18,
    comments: 4,
    liked: false,
  },
  {
    id: 3,
    author: "Yuna",
    initial: "Y",
    avatarClass: "avatar-yellow",
    community: "本と読書",
    time: "昨日",
    content: "今月読んでよかった一冊。読み終わったあと、いつもの景色が少し違って見えるような本でした📖 次に読む本を探しているので、おすすめがあればぜひ教えてください！",
    image: "📚",
    imageClass: "books-scene",
    likes: 31,
    comments: 12,
    liked: false,
  },
];

const joinedCommunityIds = new Set(["garden", "camera", "books"]);
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
let activeFilter = "おすすめ";
let toastTimeout;

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
    community: "週末ガーデニング部",
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

renderCommunities();
renderPosts();
