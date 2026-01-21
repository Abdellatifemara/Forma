'use client';

import { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const conversations = [
  {
    id: '1',
    client: 'Mohamed Ali',
    lastMessage: 'Thanks for the new program!',
    time: '5m ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    client: 'Sara Ahmed',
    lastMessage: 'Can we reschedule tomorrow?',
    time: '1h ago',
    unread: 0,
    online: true,
  },
  {
    id: '3',
    client: 'Youssef Hassan',
    lastMessage: 'I completed the workout!',
    time: '3h ago',
    unread: 0,
    online: false,
  },
  {
    id: '4',
    client: 'Nour Ibrahim',
    lastMessage: 'Great workout today!',
    time: '1d ago',
    unread: 0,
    online: false,
  },
];

const messages = [
  {
    id: '1',
    sender: 'client',
    content: 'Hey coach! I just finished the leg workout. It was intense!',
    time: '10:30 AM',
  },
  {
    id: '2',
    sender: 'trainer',
    content: 'Great job Mohamed! How did the squats feel? Were you able to hit all the reps?',
    time: '10:32 AM',
  },
  {
    id: '3',
    sender: 'client',
    content: 'Yes! I even added 5kg to my squat. Feeling stronger every week.',
    time: '10:35 AM',
  },
  {
    id: '4',
    sender: 'trainer',
    content: "That's awesome progress! Keep up the great work. Let me adjust next week's program to keep challenging you.",
    time: '10:36 AM',
  },
  {
    id: '5',
    sender: 'client',
    content: 'Thanks for the new program!',
    time: '10:40 AM',
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // Handle sending message
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Conversations List */}
      <Card className="w-80 flex-shrink-0">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <h2 className="mb-4 text-lg font-semibold">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`cursor-pointer border-b p-4 transition-colors hover:bg-muted/50 ${
                  selectedConversation.id === conv.id ? 'bg-muted/50' : ''
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>
                        {conv.client.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{conv.client}</p>
                      <span className="text-xs text-muted-foreground">
                        {conv.time}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge variant="forma" className="h-5 w-5 rounded-full p-0">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {selectedConversation.client.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedConversation.client}</p>
              <p className="text-sm text-muted-foreground">
                {selectedConversation.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>View Program</DropdownMenuItem>
                <DropdownMenuItem>Schedule Session</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Block Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'trainer' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.sender === 'trainer'
                      ? 'bg-forma-teal text-forma-navy'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="mt-1 text-xs opacity-60">{message.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button variant="forma" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
