import { types } from "mobx-state-tree";
import { DocumentModel, DocumentModelType } from "./document";

export const WorkspaceModeEnum = types.enumeration("mode", ["1-up", "4-up"]);
export type WorkspaceMode = typeof WorkspaceModeEnum.Type;

export const WorkspaceToolEnum = types.enumeration("tool",
  ["delete", "geometry", "select", "text", "image"]);
export type WorkspaceTool = typeof WorkspaceToolEnum.Type;

export const kSectionID = "section";
export const kLearningLogID = "learningLog";
export const kPublicationID = "publication";

const selectTool = (tool: WorkspaceTool, document: DocumentModelType) => {
  switch (tool) {
    case "geometry":
      document.content.addGeometryTile();
      break;
    case "text":
      document.content.addTextTile();
      break;
    case "image":
      document.content.addImageTile();
  }
  return tool;
};

export const SectionWorkspaceModel = types
  .model("SectionWorkspace", {
    type: types.optional(types.literal(kSectionID), kSectionID),
    mode: WorkspaceModeEnum,
    tool: WorkspaceToolEnum,
    sectionId: types.string,
    document: DocumentModel,
    groupDocuments: types.map(DocumentModel),
    visibility: types.enumeration("VisibilityType", ["public", "private"]),
  })
  .actions((self) => {
    return {
      toggleMode(override?: WorkspaceMode) {
        self.mode = typeof override === "undefined"
          ? (self.mode === "1-up" ? "4-up" : "1-up")
          : override;
      },

      selectTool(tool: WorkspaceTool) {
        self.tool = selectTool(tool, self.document);
      },

      deleteTile(tileId: string) {
        self.document.content.deleteTile(tileId);
      },

      toggleVisibility(overide?: "public" | "private") {
        self.visibility = typeof overide === "undefined"
          ? (self.visibility === "public" ? "private" : "public")
          : overide;
      },

      setGroupDocument(uid: string, document: DocumentModelType) {
        self.groupDocuments.set(uid, document);
      }
    };
  });

export const LearningLogWorkspaceModel = types
  .model("LearningLogWorkspace", {
    type: types.optional(types.literal(kLearningLogID), kLearningLogID),
    tool: WorkspaceToolEnum,
    document: DocumentModel,
    title: types.string,
    createdAt: types.number,
    mode: types.optional(types.literal("1-up"), "1-up")
  })
  .actions((self) => {
    return {
      selectTool(tool: WorkspaceTool) {
        self.tool = selectTool(tool, self.document);
      },

      deleteTile(tileId: string) {
        self.document.content.deleteTile(tileId);
      },

      setTitle(title: string) {
        self.title = title;
      }
    };
  });

export const PublishedWorkspaceModel = types
  .model("PublishedWorkspace", {
    type: types.optional(types.literal(kPublicationID), kPublicationID),
    document: DocumentModel,
    createdAt: types.number,
    userId: types.string,
    groupId: types.string,
    sectionId: types.string,
    groupUserConnections: types.map(types.boolean)
  })
  .views(self => ({
    get mode() {
      return "1-up";
    },
    get tool() {
      return undefined;
    }
  }));

export const WorkspacesModel = types
  .model("Workspaces", {
    sections: types.array(SectionWorkspaceModel),
    learningLogs: types.array(LearningLogWorkspaceModel),
    publications: types.array(PublishedWorkspaceModel)
  })
  .views((self) => {
    const findByDocumentId = (documentKey: string) => {
      return (workspace: WorkspaceModelType) => workspace.document.key === documentKey;
    };
    return {
      findByDocumentId,

      getSectionWorkspace(sectionId: string) {
        return self.sections.find((workspace) => workspace.sectionId === sectionId);
      },

      getWorkspace(documentKey: string) {
        return self.sections.find(findByDocumentId(documentKey))
               || self.learningLogs.find(findByDocumentId(documentKey))
               || self.publications.find(findByDocumentId(documentKey));
      },

      getLearningLogWorkspace(documentKey: string) {
        return self.learningLogs.find(findByDocumentId(documentKey));
      },
    };
  })
  .actions((self) => {
    return {
      addSectionWorkspace(workspace: SectionWorkspaceModelType) {
        if (!self.getSectionWorkspace(workspace.sectionId)) {
          self.sections.push(workspace);
        }
        return workspace;
      },

      addLearningLogWorkspace(learningLog: LearningLogWorkspaceModelType) {
        if (!self.getLearningLogWorkspace(learningLog.document.key)) {
          self.learningLogs.push(learningLog);
        }
        return learningLog;
      },

      deleteLearningLogWorkspace(learningLog: LearningLogWorkspaceModelType) {
        self.learningLogs.remove(learningLog);
        return learningLog;
      },

      addPublishedWorkspace(publication: PublishedWorkspaceModelType) {
        self.publications.push(publication);
      },
    };
  });

export type WorkspacesModelType = typeof WorkspacesModel.Type;
export type SectionWorkspaceModelType = typeof SectionWorkspaceModel.Type;
export type LearningLogWorkspaceModelType = typeof LearningLogWorkspaceModel.Type;
export type PublishedWorkspaceModelType = typeof PublishedWorkspaceModel.Type;
export type WorkspaceModelType = SectionWorkspaceModelType
                                  | LearningLogWorkspaceModelType
                                  | PublishedWorkspaceModelType;
