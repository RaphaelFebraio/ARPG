import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { ChatMessage } from '../../stores/useChatStore';

export type ChatBubbleProps = {
  message: ChatMessage;
};

// DECISION: the RAG assistant is prompted to answer spells/monsters as
// "Label: value" lines (see server/src/prompts/rules-assistant.ts). Rather
// than pulling in a markdown renderer for what's still plain text, this
// bolds the label on any line that looks like one — a lightweight stand-in
// for the "formatação rica" the spec asks for.
const LABEL_LINE = /^([A-ZÀ-Ú][\wà-úÀ-Ú ]{1,30}):\s+(.+)$/;

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <View
      className={`max-w-[88%] rounded-2xl px-4 py-3 ${
        isUser ? 'self-end bg-gold' : 'self-start border border-hairline bg-background-elevated'
      }`}
    >
      {message.content.split('\n').map((line, index) => {
        if (line.trim().length === 0) {
          return <View key={index} className="h-2" />;
        }

        const match = !isUser ? LABEL_LINE.exec(line) : null;

        return (
          <Text key={index} className={`mb-0.5 font-sans text-sm ${isUser ? 'text-background' : 'text-ink/90'}`}>
            {match ? (
              <Fragment>
                <Text className="font-semibold text-gold">{match[1]}: </Text>
                {match[2]}
              </Fragment>
            ) : (
              line
            )}
          </Text>
        );
      })}

      {!isUser && message.sources && message.sources.length > 0 ? (
        <View className="mt-2 flex-row flex-wrap gap-1 border-t border-hairline pt-2">
          {message.sources.map((source, index) => (
            <View key={`${source.entityName}-${index}`} className="rounded-full border border-gold/30 px-2 py-0.5">
              <Text className="font-sans text-[10px] text-gold">{source.entityName}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};
