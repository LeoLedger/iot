package hw.topevery.basis.framework;

import hw.topevery.framework.db.DbExecute;

public class Database {
    public static final DbExecute pmiDbExecute;
    public static final DbExecute fmpDbExecute;

    static {
        pmiDbExecute = DbExecute.getInstance("pmiDatabase");
        fmpDbExecute = DbExecute.getInstance("fmpDatabase");
    }
}
