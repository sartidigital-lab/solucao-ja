-- 1. Create Chat Rooms Table
CREATE TABLE public.chat_rooms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT unique_client_professional UNIQUE (client_id, professional_id)
);

-- Indexes for room lookups
CREATE INDEX idx_chat_rooms_client ON public.chat_rooms(client_id);
CREATE INDEX idx_chat_rooms_professional ON public.chat_rooms(professional_id);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Rooms
CREATE POLICY "Users can view rooms they are part of" ON public.chat_rooms
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "Users can create rooms they are part of" ON public.chat_rooms
    FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = professional_id);


-- 2. Create Chat Messages Table
CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for messages performance
CREATE INDEX idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Messages
CREATE POLICY "Members can view messages in their room" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE chat_rooms.id = chat_messages.room_id 
            AND (chat_rooms.client_id = auth.uid() OR chat_rooms.professional_id = auth.uid())
        )
    );

CREATE POLICY "Members can insert messages in their room" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id 
        AND EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE chat_rooms.id = chat_messages.room_id 
            AND (chat_rooms.client_id = auth.uid() OR chat_rooms.professional_id = auth.uid())
        )
    );

CREATE POLICY "Members can update messages in their room" ON public.chat_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE chat_rooms.id = chat_messages.room_id 
            AND (chat_rooms.client_id = auth.uid() OR chat_rooms.professional_id = auth.uid())
        )
    );

-- 3. Enable Realtime Publications
-- Add chat_rooms and chat_messages to Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
