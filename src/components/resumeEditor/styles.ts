import {StyleSheet} from 'react-native';

export const editorColors = {
  primary: '#2563EB',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
  border: '#E2E8F0',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  danger: '#B91C1C',
  accent: '#14B8A6',
};

export const editorStyles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: editorColors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dragHandle: {
    color: editorColors.subtle,
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: editorColors.text,
    flex: 1,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '700',
    color: editorColors.text,
    flex: 1,
    paddingVertical: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  fieldGap: {
    gap: 12,
  },
  hiddenBadge: {
    fontSize: 12,
    color: editorColors.muted,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 13,
    color: editorColors.muted,
    fontStyle: 'italic',
  },
  entryCard: {
    borderWidth: 1,
    borderColor: editorColors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: editorColors.text,
    flex: 1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 13,
    color: editorColors.primary,
  },
  groupCard: {
    borderWidth: 1,
    borderColor: editorColors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: editorColors.text,
  },
  body: {
    fontSize: 14,
    color: editorColors.muted,
    lineHeight: 20,
  },
});
