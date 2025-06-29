import { 
  users, 
  notes, 
  posts, 
  likes, 
  comments, 
  achievements,
  type User, 
  type InsertUser,
  type Note,
  type InsertNote,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type Like,
  type Achievement
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: number, credits: number): Promise<void>;
  
  // Note methods
  createNote(note: InsertNote & { authorId: number }): Promise<Note>;
  getNotes(limit?: number, offset?: number): Promise<(Note & { author: User; likesCount: number; isLiked?: boolean })[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  likeNote(userId: number, noteId: number): Promise<void>;
  unlikeNote(userId: number, noteId: number): Promise<void>;
  
  // Post methods
  createPost(post: InsertPost & { authorId: number }): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<(Post & { author: User; isLiked?: boolean })[]>;
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  
  // Comment methods
  createComment(comment: InsertComment & { authorId: number }): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]>;
  getCommentsByNote(noteId: number): Promise<(Comment & { author: User })[]>;
  
  // Achievement methods
  createAchievement(achievement: { userId: number; type: string; title: string; description?: string; creditsAwarded?: number }): Promise<Achievement>;
  getUserAchievements(userId: number, limit?: number): Promise<Achievement[]>;
  
  // Leaderboard methods
  getTopUsers(limit?: number): Promise<User[]>;
  
  // Stats methods
  getUserStats(userId: number): Promise<{ notesCount: number; likesReceived: number; rank: number }>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        credits: 100, // Starting credits
      })
      .returning();
    return user;
  }

  async updateUserCredits(userId: number, creditsToAdd: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        credits: sql`${users.credits} + ${creditsToAdd}` 
      })
      .where(eq(users.id, userId));
  }

  async createNote(noteData: InsertNote & { authorId: number }): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(noteData)
      .returning();
    
    // Award credits to user
    await this.updateUserCredits(noteData.authorId, noteData.creditsAwarded || 50);
    
    // Check for first note achievement
    const userNotesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(notes)
      .where(eq(notes.authorId, noteData.authorId));
    
    if (userNotesCount[0].count === 1) {
      await this.createAchievement({
        userId: noteData.authorId,
        type: "first_note",
        title: "Primer Apunte",
        description: "Has subido tu primer apunte",
        creditsAwarded: 25,
      });
    }
    
    return note;
  }

  async getNotes(limit = 20, offset = 0): Promise<(Note & { author: User; likesCount: number })[]> {
    const result = await db
      .select({
        note: notes,
        author: users,
        likesCount: sql<number>`count(${likes.id})`.as('likesCount'),
      })
      .from(notes)
      .leftJoin(users, eq(notes.authorId, users.id))
      .leftJoin(likes, eq(likes.noteId, notes.id))
      .groupBy(notes.id, users.id)
      .orderBy(desc(notes.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.note,
      author: row.author!,
      likesCount: row.likesCount,
    }));
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async likeNote(userId: number, noteId: number): Promise<void> {
    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.noteId, noteId)));

    if (!existingLike) {
      await db.insert(likes).values({ userId, noteId });
      
      // Update note likes count
      await db
        .update(notes)
        .set({ likesCount: sql`${notes.likesCount} + 1` })
        .where(eq(notes.id, noteId));
    }
  }

  async unlikeNote(userId: number, noteId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.noteId, noteId)));
    
    // Update note likes count
    await db
      .update(notes)
      .set({ likesCount: sql`${notes.likesCount} - 1` })
      .where(eq(notes.id, noteId));
  }

  async createPost(postData: InsertPost & { authorId: number }): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(postData)
      .returning();
    return post;
  }

  async getPosts(limit = 20, offset = 0): Promise<(Post & { author: User })[]> {
    const result = await db
      .select({
        post: posts,
        author: users,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.post,
      author: row.author!,
    }));
  }

  async likePost(userId: number, postId: number): Promise<void> {
    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

    if (!existingLike) {
      await db.insert(likes).values({ userId, postId });
      
      // Update post likes count
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));
    }
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    
    // Update post likes count
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} - 1` })
      .where(eq(posts.id, postId));
  }

  async createComment(commentData: InsertComment & { authorId: number }): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(commentData)
      .returning();

    // Update comments count for post or note
    if (commentData.postId) {
      await db
        .update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} + 1` })
        .where(eq(posts.id, commentData.postId));
    }

    return comment;
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]> {
    const result = await db
      .select({
        comment: comments,
        author: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return result.map(row => ({
      ...row.comment,
      author: row.author!,
    }));
  }

  async getCommentsByNote(noteId: number): Promise<(Comment & { author: User })[]> {
    const result = await db
      .select({
        comment: comments,
        author: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.noteId, noteId))
      .orderBy(desc(comments.createdAt));

    return result.map(row => ({
      ...row.comment,
      author: row.author!,
    }));
  }

  async createAchievement(achievementData: { userId: number; type: string; title: string; description?: string; creditsAwarded?: number }): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(achievementData)
      .returning();
    
    // Award credits if specified
    if (achievementData.creditsAwarded) {
      await this.updateUserCredits(achievementData.userId, achievementData.creditsAwarded);
    }
    
    return achievement;
  }

  async getUserAchievements(userId: number, limit = 5): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.createdAt))
      .limit(limit);
  }

  async getTopUsers(limit = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.credits))
      .limit(limit);
  }

  async getUserStats(userId: number): Promise<{ notesCount: number; likesReceived: number; rank: number }> {
    // Get notes count
    const notesCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(notes)
      .where(eq(notes.authorId, userId));
    
    // Get likes received on user's notes
    const likesReceivedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes)
      .leftJoin(notes, eq(likes.noteId, notes.id))
      .where(eq(notes.authorId, userId));
    
    // Get user's rank based on credits
    const rankResult = await db
      .select({ 
        rank: sql<number>`rank() over (order by ${users.credits} desc)` 
      })
      .from(users)
      .where(eq(users.id, userId));
    
    return {
      notesCount: notesCountResult[0]?.count || 0,
      likesReceived: likesReceivedResult[0]?.count || 0,
      rank: rankResult[0]?.rank || 0,
    };
  }
}

export const storage = new DatabaseStorage();
