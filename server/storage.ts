import {
  users,
  colleges,
  posts,
  postLikes,
  postComments,
  events,
  eventAttendees,
  type User,
  type UpsertUser,
  type College,
  type InsertCollege,
  type Post,
  type InsertPost,
  type Event,
  type InsertEvent,
  type EventAttendee,
  type InsertEventAttendee,
  type OnboardingData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Alumni Connect specific operations
  updateUserOnboarding(userId: string, data: OnboardingData): Promise<User>;
  updateUserProfile(userId: string, updates: { firstName?: string; lastName?: string; department?: string; batch?: string; bio?: string; location?: string }): Promise<User>;
  
  // Community stats
  getCollegeStats(collegeId: number): Promise<{
    studentsCount: number;
    alumniCount: number;
    totalPosts: number;
  }>;
  
  // College operations
  getAllColleges(): Promise<College[]>;
  createCollege(college: InsertCollege): Promise<College>;
  
  // Post operations
  getPostsByCollege(collegeId: number, limit?: number, offset?: number, currentUserId?: string, category?: string): Promise<Array<Post & {
    author: User;
    likesCount: number;
    commentsCount: number;
    isLikedByUser?: boolean;
  }>>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(postId: number, userId: string, updates: { title?: string; content?: string; category?: string; location?: string }): Promise<Post | null>;
  deletePost(postId: number, userId: string): Promise<boolean>;
  
  // Interaction operations
  togglePostLike(postId: number, userId: string): Promise<boolean>;
  addComment(postId: number, authorId: string, content: string): Promise<void>;
  getPostComments(postId: number): Promise<Array<{
    id: number;
    content: string;
    createdAt: Date | null;
    author: User;
  }>>;

  // Event operations
  getEventsByCollege(collegeId: number, limit?: number, offset?: number): Promise<Array<Event & {
    organizer: User;
    attendeesCount: number;
    userAttendanceStatus?: string;
  }>>;
  getEvent(eventId: number, userId?: string): Promise<(Event & {
    organizer: User;
    attendeesCount: number;
    userAttendanceStatus?: string;
  }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(eventId: number, userId: string, updates: { title?: string; description?: string; startDate?: Date; endDate?: Date; location?: string; category?: string; isVirtual?: boolean; meetingLink?: string; maxAttendees?: number }): Promise<Event | null>;
  deleteEvent(eventId: number, userId: string): Promise<boolean>;
  updateEventAttendance(eventId: number, userId: string, status: string): Promise<boolean>;
  getEventAttendees(eventId: number): Promise<Array<{
    id: number;
    status: string;
    createdAt: Date | null;
    user: User;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserOnboarding(userId: string, data: OnboardingData): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        collegeId: data.collegeId,
        role: data.role,
        department: data.department,
        batch: data.batch,
        isOnboarded: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // College operations
  async getAllColleges(): Promise<College[]> {
    return await db.select().from(colleges);
  }

  async createCollege(college: InsertCollege): Promise<College> {
    const [newCollege] = await db.insert(colleges).values(college).returning();
    return newCollege;
  }

  // Post operations
  async getPostsByCollege(collegeId: number, limit: number = 20, offset: number = 0, currentUserId?: string, category?: string): Promise<Array<Post & {
    author: User;
    likesCount: number;
    commentsCount: number;
    isLikedByUser?: boolean;
  }>> {
    let query = db
      .select({
        post: posts,
        author: users,
        likesCount: sql<number>`count(distinct ${postLikes.id})`.as('likes_count'),
        commentsCount: sql<number>`count(distinct ${postComments.id})`.as('comments_count'),
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(postLikes, eq(posts.id, postLikes.postId))
      .leftJoin(postComments, eq(posts.id, postComments.postId))
      .where(eq(posts.collegeId, collegeId))
      .groupBy(posts.id, users.id)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    if (category && category !== 'all') {
      query = db
        .select({
          post: posts,
          author: users,
          likesCount: sql<number>`count(distinct ${postLikes.id})`.as('likes_count'),
          commentsCount: sql<number>`count(distinct ${postComments.id})`.as('comments_count'),
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .leftJoin(postLikes, eq(posts.id, postLikes.postId))
        .leftJoin(postComments, eq(posts.id, postComments.postId))
        .where(and(eq(posts.collegeId, collegeId), eq(posts.category, category as any)))
        .groupBy(posts.id, users.id)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const result = await query;

    const postsWithLikes = await Promise.all(result.map(async (row) => {
      let isLikedByUser = false;
      if (currentUserId) {
        const userLike = await db
          .select()
          .from(postLikes)
          .where(and(eq(postLikes.postId, row.post.id), eq(postLikes.userId, currentUserId)))
          .limit(1);
        isLikedByUser = userLike.length > 0;
      }

      return {
        ...row.post,
        author: row.author!,
        likesCount: Number(row.likesCount),
        commentsCount: Number(row.commentsCount),
        isLikedByUser,
      };
    }));

    return postsWithLikes;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  // Interaction operations
  async togglePostLike(postId: number, userId: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      return false;
    } else {
      // Like
      await db.insert(postLikes).values({ postId, userId });
      return true;
    }
  }

  async addComment(postId: number, authorId: string, content: string): Promise<void> {
    await db.insert(postComments).values({ postId, authorId, content });
  }

  async getPostComments(postId: number): Promise<Array<{
    id: number;
    content: string;
    createdAt: Date | null;
    author: User;
  }>> {
    const result = await db
      .select({
        comment: postComments,
        author: users,
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.authorId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);

    return result.map(row => ({
      id: row.comment.id,
      content: row.comment.content,
      createdAt: row.comment.createdAt,
      author: row.author!,
    }));
  }

  async getCollegeStats(collegeId: number): Promise<{
    studentsCount: number;
    alumniCount: number;
    totalPosts: number;
  }> {
    const [stats] = await db
      .select({
        studentsCount: sql<number>`count(case when ${users.role} = 'student' then 1 end)`,
        alumniCount: sql<number>`count(case when ${users.role} = 'alumni' then 1 end)`,
        totalPosts: sql<number>`(select count(*) from ${posts} where ${posts.collegeId} = ${collegeId})`
      })
      .from(users)
      .where(eq(users.collegeId, collegeId));

    return {
      studentsCount: Number(stats?.studentsCount || 0),
      alumniCount: Number(stats?.alumniCount || 0),
      totalPosts: Number(stats?.totalPosts || 0),
    };
  }

  async updatePost(postId: number, userId: string, updates: { 
    title?: string; 
    content?: string; 
    category?: string; 
    location?: string 
  }): Promise<Post | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.category !== undefined) updateData.category = updates.category as "jobs" | "advice" | "memories" | "events" | "general";
    if (updates.location !== undefined) updateData.location = updates.location;

    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(and(eq(posts.id, postId), eq(posts.authorId, userId)))
      .returning();
    
    return updatedPost || null;
  }

  async deletePost(postId: number, userId: string): Promise<boolean> {
    // First delete related comments
    await db.delete(postComments).where(eq(postComments.postId, postId));
    
    // Then delete related likes
    await db.delete(postLikes).where(eq(postLikes.postId, postId));
    
    // Finally delete the post
    const result = await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.authorId, userId)))
      .returning();
    
    return result.length > 0;
  }

  async updateUserProfile(userId: string, updates: { 
    firstName?: string; 
    lastName?: string; 
    department?: string; 
    batch?: string; 
    bio?: string; 
    location?: string 
  }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Event operations
  async getEventsByCollege(collegeId: number, limit: number = 20, offset: number = 0): Promise<Array<Event & {
    organizer: User;
    attendeesCount: number;
    userAttendanceStatus?: string;
  }>> {
    const result = await db
      .select({
        event: events,
        organizer: users,
        attendeesCount: sql<number>`COALESCE(COUNT(${eventAttendees.id}), 0)`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventAttendees, eq(events.id, eventAttendees.eventId))
      .where(eq(events.collegeId, collegeId))
      .groupBy(events.id, users.id)
      .orderBy(desc(events.startDate))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.event,
      organizer: row.organizer!,
      attendeesCount: row.attendeesCount,
    }));
  }

  async getEvent(eventId: number, userId?: string): Promise<(Event & {
    organizer: User;
    attendeesCount: number;
    userAttendanceStatus?: string;
  }) | undefined> {
    const result = await db
      .select({
        event: events,
        organizer: users,
        attendeesCount: sql<number>`COALESCE(COUNT(${eventAttendees.id}), 0)`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventAttendees, eq(events.id, eventAttendees.eventId))
      .where(eq(events.id, eventId))
      .groupBy(events.id, users.id);

    if (result.length === 0) return undefined;

    const event = result[0];
    let userAttendanceStatus: string | undefined;

    if (userId) {
      const attendance = await db
        .select()
        .from(eventAttendees)
        .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
      
      userAttendanceStatus = attendance[0]?.status;
    }

    return {
      ...event.event,
      organizer: event.organizer!,
      attendeesCount: event.attendeesCount,
      userAttendanceStatus,
    };
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateEvent(eventId: number, userId: string, updates: { 
    title?: string; 
    description?: string; 
    startDate?: Date; 
    endDate?: Date; 
    location?: string; 
    category?: string; 
    isVirtual?: boolean; 
    meetingLink?: string; 
    maxAttendees?: number 
  }): Promise<Event | null> {
    const [event] = await db
      .update(events)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, eventId), eq(events.organizerId, userId)))
      .returning();
    return event || null;
  }

  async deleteEvent(eventId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, eventId), eq(events.organizerId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateEventAttendance(eventId: number, userId: string, status: string): Promise<boolean> {
    try {
      await db
        .insert(eventAttendees)
        .values({
          eventId,
          userId,
          status,
        })
        .onConflictDoUpdate({
          target: [eventAttendees.eventId, eventAttendees.userId],
          set: {
            status,
            createdAt: new Date(),
          },
        });
      return true;
    } catch (error) {
      console.error("Error updating event attendance:", error);
      return false;
    }
  }

  async getEventAttendees(eventId: number): Promise<Array<{
    id: number;
    status: string;
    createdAt: Date | null;
    user: User;
  }>> {
    const result = await db
      .select({
        attendee: eventAttendees,
        user: users,
      })
      .from(eventAttendees)
      .leftJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId))
      .orderBy(desc(eventAttendees.createdAt));

    return result.map(row => ({
      id: row.attendee.id,
      status: row.attendee.status,
      createdAt: row.attendee.createdAt,
      user: row.user!,
    }));
  }
}

export const storage = new DatabaseStorage();
