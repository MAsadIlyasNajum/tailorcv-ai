import {StyleSheet} from 'react-native';

export const editorColors = {
  primary: '#004AC6',
  text: '#131B2E',
  muted: '#434655',
  subtle: '#737686',
  border: '#E2E7FF',
  surface: '#FFFFFF',
  background: '#FAF8FF',
  danger: '#93000A',
  accent: '#712AE2',
};

export const editorStyles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: editorColors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 10,
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
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.07,
    fontFamily: 'Inter',
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
  headerAction: {
    minWidth: 32,
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerActionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
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
  emptyStateCard: {
    borderTopColor: editorColors.accent,
    borderTopWidth: 3,
    backgroundColor: '#F0FDFA',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: editorColors.text,
  },
  editorSubtitle: {
    fontSize: 13,
    color: editorColors.muted,
  },
  saveIndicator: {
    fontSize: 12,
    color: editorColors.muted,
  },
});
