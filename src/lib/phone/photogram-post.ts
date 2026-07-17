export interface PhotogramPostComment {
  commentId: string;
  authorHandle: string;
  commentText: string;
}

export interface PhotogramPost {
  postId: string;
  imagePath: string;
  captionText: string;
  likeCount: number;
  postedAtLabel: string;
  authorHandle: string;
  comments: PhotogramPostComment[];
}

export function buildPhotogramImagePath(fileName: string): string {
  return `/photogram/${encodeURIComponent(fileName)}`;
}

export function findPhotogramPostById(
  postList: PhotogramPost[],
  postId: string | null,
): PhotogramPost | null {
  if (!postId) return null;
  return postList.find((postItem) => postItem.postId === postId) ?? null;
}
