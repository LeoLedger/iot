package hw.topevery.basis.framework.base;

public interface IHasProjectId {

    String DEFAULT_COLUMN_NAME ="c_project_id";

    String getProjectId();
    void setProjectId(String guidId);
}
